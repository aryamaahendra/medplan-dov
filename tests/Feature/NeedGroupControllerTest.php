<?php

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->admin()->create();
    $this->be($this->user);
});

it('can view need groups index', function () {
    $group = NeedGroup::factory()->create();
    Need::factory()->count(2)->create([
        'need_group_id' => $group->id,
        'total_price' => 1000,
        'approved_by_director_at' => now(),
        'is_priority' => true,
    ]);

    $response = $this->get(route('need-groups.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('need/groups/index')
            ->has('needGroups.data', 1)
            ->where('needGroups.data.0.total_budget', '2000.00')
            ->where('needGroups.data.0.approved_count', 2)
            ->where('needGroups.data.0.priority_count', 2)
        );
});

it('can store a need group with submission window timestamps', function () {
    $data = [
        'name' => 'New Group',
        'year' => 2026,
        'description' => 'New Description',
        'is_active' => true,
        'submission_start_at' => '2026-06-01 00:00:00',
        'submission_end_at' => '2026-06-30 23:59:59',
    ];

    $response = $this->post(route('need-groups.store'), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('need_groups', [
        'name' => 'New Group',
        'year' => 2026,
    ]);
    $group = NeedGroup::where('name', 'New Group')->first();
    expect($group->submission_start_at?->format('Y-m-d H:i:s'))->toBe('2026-06-01 00:00:00')
        ->and($group->submission_end_at?->format('Y-m-d H:i:s'))->toBe('2026-06-30 23:59:59');
});

it('can update a need group with submission window timestamps', function () {
    $group = NeedGroup::factory()->create(['name' => 'Old Name']);

    $data = [
        'name' => 'Updated Name',
        'year' => 2027,
        'is_active' => false,
        'submission_start_at' => '2026-07-01 08:00:00',
        'submission_end_at' => '2026-07-31 17:00:00',
    ];

    $response = $this->patch(route('need-groups.update', $group), $data);

    $response->assertRedirect();
    $group->refresh();
    expect($group->name)->toBe('Updated Name')
        ->and($group->is_active)->toBeFalse()
        ->and($group->submission_start_at?->format('Y-m-d H:i:s'))->toBe('2026-07-01 08:00:00')
        ->and($group->submission_end_at?->format('Y-m-d H:i:s'))->toBe('2026-07-31 17:00:00');
});

it('can delete a need group', function () {
    $group = NeedGroup::factory()->create();

    $response = $this->delete(route('need-groups.destroy', $group));

    $response->assertRedirect();
    $this->assertSoftDeleted('need_groups', ['id' => $group->id]);
});
