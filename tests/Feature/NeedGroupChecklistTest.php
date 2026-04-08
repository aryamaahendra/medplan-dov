<?php

use App\Models\ChecklistQuestion;
use App\Models\NeedGroup;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->needGroup = NeedGroup::factory()->create();
});

it('can access the checklist management page', function () {
    $response = $this->actingAs($this->user)
        ->get(route('need-groups.checklists.index', $this->needGroup));

    $response->assertStatus(200);
});

it('can sync checklist questions for a need group', function () {
    $questions = ChecklistQuestion::factory()->count(3)->create();

    $syncData = [
        'questions' => [
            [
                'id' => $questions[0]->id,
                'is_active' => true,
                'is_required' => true,
                'order_column' => 1,
            ],
            [
                'id' => $questions[1]->id,
                'is_active' => false,
                'is_required' => false,
                'order_column' => 2,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)
        ->put(route('need-groups.checklists.update', $this->needGroup), $syncData);

    $response->assertRedirect();
    $this->assertDatabaseCount('need_group_checklist_question', 2);

    $this->assertDatabaseHas('need_group_checklist_question', [
        'need_group_id' => $this->needGroup->id,
        'checklist_question_id' => $questions[0]->id,
        'is_active' => true,
        'is_required' => true,
        'order_column' => 1,
    ]);

    $this->assertDatabaseHas('need_group_checklist_question', [
        'need_group_id' => $this->needGroup->id,
        'checklist_question_id' => $questions[1]->id,
        'is_active' => false,
        'is_required' => false,
        'order_column' => 2,
    ]);
});

it('detaches questions not included in the sync data', function () {
    $questions = ChecklistQuestion::factory()->count(2)->create();
    $this->needGroup->checklistQuestions()->attach($questions->pluck('id')->toArray(), [
        'order_column' => 1,
        'is_active' => true,
        'is_required' => false,
    ]);

    $this->assertDatabaseCount('need_group_checklist_question', 2);

    $syncData = [
        'questions' => [
            [
                'id' => $questions[0]->id,
                'is_active' => true,
                'is_required' => true,
                'order_column' => 1,
            ],
        ],
    ];

    $response = $this->actingAs($this->user)
        ->put(route('need-groups.checklists.update', $this->needGroup), $syncData);

    $response->assertRedirect();
    $this->assertDatabaseCount('need_group_checklist_question', 1);
    $this->assertDatabaseMissing('need_group_checklist_question', [
        'checklist_question_id' => $questions[1]->id,
    ]);
});
