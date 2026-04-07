<?php

use App\Models\ChecklistQuestion;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('can list all checklist questions', function () {
    ChecklistQuestion::factory()->create(['order_column' => 2, 'created_at' => now()->subDay()]);
    ChecklistQuestion::factory()->create(['order_column' => 1, 'created_at' => now()]);

    actingAs($this->user)
        ->getJson(route('checklist-questions.index'))
        ->assertSuccessful()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.order_column', 1)
        ->assertJsonPath('data.1.order_column', 2);
});

it('can create a checklist question', function () {
    actingAs($this->user)
        ->postJson(route('checklist-questions.store'), [
            'question' => 'Is this a test?',
            'description' => 'A test description',
            'is_active' => true,
            'order_column' => 5,
        ])
        ->assertSuccessful()
        ->assertJsonPath('data.question', 'Is this a test?');

    assertDatabaseHas('checklist_questions', [
        'question' => 'Is this a test?',
        'order_column' => 5,
    ]);
});

it('can update a checklist question', function () {
    $question = ChecklistQuestion::factory()->create();

    actingAs($this->user)
        ->putJson(route('checklist-questions.update', $question), [
            'question' => 'Updated question?',
            'description' => 'Updated description',
            'is_active' => false,
            'order_column' => 10,
        ])
        ->assertSuccessful()
        ->assertJsonPath('data.question', 'Updated question?');

    assertDatabaseHas('checklist_questions', [
        'id' => $question->id,
        'question' => 'Updated question?',
        'is_active' => false,
        'order_column' => 10,
    ]);
});

it('can delete a checklist question', function () {
    $question = ChecklistQuestion::factory()->create();

    actingAs($this->user)
        ->deleteJson(route('checklist-questions.destroy', $question))
        ->assertSuccessful();

    assertDatabaseMissing('checklist_questions', [
        'id' => $question->id,
    ]);
});
