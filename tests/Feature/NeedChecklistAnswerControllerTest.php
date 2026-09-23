<?php

use App\Actions\Need\ChecklistAssessmentEngine;
use App\Enums\ChecklistAnswer;
use App\Models\ChecklistQuestion;
use App\Models\Need;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Spatie\Permission\Models\Role;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
    $this->need = Need::factory()->create();
    $this->seed(RolesAndPermissionsSeeder::class);
});

it('can store checklist answers for a need', function () {
    $question1 = ChecklistQuestion::factory()->create();
    $question2 = ChecklistQuestion::factory()->create();

    actingAs($this->user)
        ->post(route('needs.checklist-answers.store', $this->need), [
            'answers' => [
                [
                    'checklist_question_id' => $question1->id,
                    'answer' => ChecklistAnswer::Yes->value,
                    'notes' => 'Test notes 1',
                ],
                [
                    'checklist_question_id' => $question2->id,
                    'answer' => ChecklistAnswer::No->value,
                    'notes' => 'Test notes 2',
                ],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseHas('need_checklist_answers', [
        'need_id' => $this->need->id,
        'checklist_question_id' => $question1->id,
        'answer' => ChecklistAnswer::Yes->value,
        'notes' => 'Test notes 1',
    ]);

    assertDatabaseHas('need_checklist_answers', [
        'need_id' => $this->need->id,
        'checklist_question_id' => $question2->id,
        'answer' => ChecklistAnswer::No->value,
        'notes' => 'Test notes 2',
    ]);
});

it('can update existing checklist answers', function () {
    $question = ChecklistQuestion::factory()->create();
    $this->need->checklistAnswers()->create([
        'checklist_question_id' => $question->id,
        'answer' => ChecklistAnswer::Yes->value,
        'notes' => 'Old notes',
    ]);

    actingAs($this->user)
        ->post(route('needs.checklist-answers.store', $this->need), [
            'answers' => [
                [
                    'checklist_question_id' => $question->id,
                    'answer' => ChecklistAnswer::No->value,
                    'notes' => 'New notes',
                ],
            ],
        ])
        ->assertRedirect();

    assertDatabaseHas('need_checklist_answers', [
        'need_id' => $this->need->id,
        'checklist_question_id' => $question->id,
        'answer' => ChecklistAnswer::No->value,
        'notes' => 'New notes',
    ]);
});

it('calculates the checklist percentage correctly', function () {
    $question1 = ChecklistQuestion::factory()->create();
    $question2 = ChecklistQuestion::factory()->create();
    $question3 = ChecklistQuestion::factory()->create();
    $question4 = ChecklistQuestion::factory()->create();

    actingAs($this->user)
        ->post(route('needs.checklist-answers.store', $this->need), [
            'answers' => [
                ['checklist_question_id' => $question1->id, 'answer' => ChecklistAnswer::Yes->value], // yes
                ['checklist_question_id' => $question2->id, 'answer' => ChecklistAnswer::No->value],  // no
                ['checklist_question_id' => $question3->id, 'answer' => ChecklistAnswer::NotApplicable->value], // skip
                ['checklist_question_id' => $question4->id, 'answer' => ChecklistAnswer::Yes->value], // yes
            ],
        ])
        ->assertRedirect();

    // 2 Yes, 1 No = 2 / 3 = 66.67%
    $this->need->refresh();
    expect((float) $this->need->checklist_percentage)->toBe(66.67);
});

it('recalculates percentage when an answer is deleted via ChecklistAssessmentEngine', function () {
    $question1 = ChecklistQuestion::factory()->create();
    $question2 = ChecklistQuestion::factory()->create();

    $engine = app(ChecklistAssessmentEngine::class);

    $engine->evaluate($this->need, [
        ['checklist_question_id' => $question1->id, 'answer' => ChecklistAnswer::Yes->value],
        ['checklist_question_id' => $question2->id, 'answer' => ChecklistAnswer::No->value],
    ]);

    $this->need->refresh();
    expect((float) $this->need->checklist_percentage)->toBe(50.0);

    $answer1 = $this->need->checklistAnswers()->where('checklist_question_id', $question1->id)->first();
    $engine->deleteAnswer($answer1);

    $this->need->refresh();
    // Only 1 No left = 0% Yes
    expect((float) $this->need->checklist_percentage)->toBe(0.0);
});

it('allows a planner without proposal update permission to store checklist answers and trigger score recalculation', function () {
    $role = Role::findByName('planner');
    $role->revokePermissionTo(['update any needs', 'update descendant needs', 'update needs']);

    $planner = User::factory()->create();
    $planner->assignRole('planner');
    expect($planner->can('update', $this->need))->toBeFalse();
    expect($planner->can('performChecklist', $this->need))->toBeTrue();

    $question = ChecklistQuestion::factory()->create();

    actingAs($planner)
        ->post(route('needs.checklist-answers.store', $this->need), [
            'answers' => [
                [
                    'checklist_question_id' => $question->id,
                    'answer' => ChecklistAnswer::Yes->value,
                    'notes' => 'Evaluator notes',
                ],
            ],
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    assertDatabaseHas('need_checklist_answers', [
        'need_id' => $this->need->id,
        'checklist_question_id' => $question->id,
        'answer' => ChecklistAnswer::Yes->value,
    ]);

    $this->need->refresh();
    expect((float) $this->need->checklist_percentage)->toBe(100.0);
});

it('forbids users without perform checklist permission from storing checklist answers', function () {
    // Staff user has update needs (for their own unit) but does NOT have 'perform checklist'
    $staff = User::factory()->create([
        'organizational_unit_id' => $this->need->organizational_unit_id,
    ]);
    // Staff role does not have 'perform checklist'

    $question = ChecklistQuestion::factory()->create();

    actingAs($staff)
        ->post(route('needs.checklist-answers.store', $this->need), [
            'answers' => [
                [
                    'checklist_question_id' => $question->id,
                    'answer' => ChecklistAnswer::Yes->value,
                    'notes' => 'Unauthorized notes',
                ],
            ],
        ])
        ->assertForbidden();
});

it('updates checklist score atomically without firing observer cycles', function () {
    $engine = app(ChecklistAssessmentEngine::class);

    $questions = ChecklistQuestion::factory()->count(5)->create();

    $answers = [
        ['checklist_question_id' => $questions[0]->id, 'answer' => ChecklistAnswer::Yes->value],
        ['checklist_question_id' => $questions[1]->id, 'answer' => ChecklistAnswer::Yes->value],
        ['checklist_question_id' => $questions[2]->id, 'answer' => ChecklistAnswer::No->value],
        ['checklist_question_id' => $questions[3]->id, 'answer' => ChecklistAnswer::NotApplicable->value],
        ['checklist_question_id' => $questions[4]->id, 'answer' => ChecklistAnswer::Yes->value],
    ];

    $percentage = $engine->evaluate($this->need, $answers);

    // 3 Yes, 1 No = 3 / 4 = 75.0%
    expect($percentage)->toBe(75.0);

    $this->need->refresh();
    expect((float) $this->need->checklist_percentage)->toBe(75.0);
});
