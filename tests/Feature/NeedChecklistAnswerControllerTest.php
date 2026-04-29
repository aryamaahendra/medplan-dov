<?php

use App\Enums\ChecklistAnswer;
use App\Models\ChecklistQuestion;
use App\Models\Need;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
    $this->need = Need::factory()->create();
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

it('recalculates percentage when an answer is deleted', function () {
    $question1 = ChecklistQuestion::factory()->create();
    $question2 = ChecklistQuestion::factory()->create();

    $answer1 = $this->need->checklistAnswers()->create([
        'checklist_question_id' => $question1->id,
        'answer' => ChecklistAnswer::Yes->value,
    ]);

    $this->need->checklistAnswers()->create([
        'checklist_question_id' => $question2->id,
        'answer' => ChecklistAnswer::No->value,
    ]);

    // Recalculate manually once because we created via relationship (does it trigger observer?)
    // Actually relationship created() should trigger Observer if registered correctly.
    // But let's verify.
    $this->need->refresh();
    // 1 Yes, 1 No = 50%
    // Wait, let's check if the observer works on creation too.
    // My observer has 'saved' which covers created and updated.

    $answer1->delete();

    $this->need->refresh();
    // Only 1 No left = 0% Yes
    expect((float) $this->need->checklist_percentage)->toBe(0.0);
});
