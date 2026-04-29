<?php

use App\Models\ChecklistQuestion;
use App\Models\NeedGroup;
use App\Models\User;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
    $this->needGroup = NeedGroup::factory()->create();
    $this->question = ChecklistQuestion::factory()->create();
});

test('can attach a checklist question to a need group', function () {
    actingAs($this->user)
        ->postJson(route('need-groups.checklists.store', $this->needGroup), [
            'checklist_question_id' => $this->question->id,
            'is_active' => true,
            'is_required' => true,
            'order_column' => 1,
        ])
        ->assertRedirect();

    expect($this->needGroup->checklistQuestions()->find($this->question->id))
        ->not->toBeNull()
        ->pivot->is_active->toBeTrue()
        ->pivot->is_required->toBeTrue()
        ->pivot->order_column->toBe(1);
});

test('can update a checklist question pivot data via patch', function () {
    $this->needGroup->checklistQuestions()->attach($this->question->id, [
        'is_active' => true,
        'is_required' => false,
        'order_column' => 1,
    ]);

    actingAs($this->user)
        ->patchJson(route('need-groups.checklists.update', [$this->needGroup, $this->question]), [
            'is_active' => false,
            'is_required' => true,
        ])
        ->assertRedirect();

    $pivot = $this->needGroup->checklistQuestions()->find($this->question->id)->pivot;
    expect($pivot->is_active)->toBeFalse();
    expect($pivot->is_required)->toBeTrue();
});

test('can remove a checklist question from a need group', function () {
    $this->needGroup->checklistQuestions()->attach($this->question->id);

    actingAs($this->user)
        ->deleteJson(route('need-groups.checklists.destroy', [$this->needGroup, $this->question]))
        ->assertRedirect();

    expect($this->needGroup->checklistQuestions()->find($this->question->id))->toBeNull();
});

test('can reorder checklist questions', function () {
    $question2 = ChecklistQuestion::factory()->create();
    $this->needGroup->checklistQuestions()->attach($this->question->id, ['order_column' => 1]);
    $this->needGroup->checklistQuestions()->attach($question2->id, ['order_column' => 2]);

    actingAs($this->user)
        ->postJson(route('need-groups.checklists.reorder', $this->needGroup), [
            'questions' => [
                ['id' => $this->question->id, 'order_column' => 2],
                ['id' => $question2->id, 'order_column' => 1],
            ],
        ])
        ->assertRedirect();

    expect($this->needGroup->checklistQuestions()->find($this->question->id)->pivot->order_column)->toBe(2);
    expect($this->needGroup->checklistQuestions()->find($question2->id)->pivot->order_column)->toBe(1);
});
