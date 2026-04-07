<?php

use App\Enums\ChecklistAnswer;
use App\Models\ChecklistQuestion;
use App\Models\Need;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

beforeEach(function () {
    $this->user = User::factory()->create();
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
