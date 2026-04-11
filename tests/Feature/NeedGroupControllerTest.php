<?php

use App\Models\NeedGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->be($this->user);
});

it('can view need groups index', function () {
    NeedGroup::factory()->count(3)->create();

    $response = $this->get(route('need-groups.index'));

    $response->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('need/groups/index')
            ->has('needGroups.data', 3)
        );
});

it('can store a need group', function () {
    $data = [
        'name' => 'New Group',
        'year' => 2026,
        'description' => 'New Description',
        'is_active' => true,
    ];

    $response = $this->post(route('need-groups.store'), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('need_groups', [
        'name' => 'New Group',
        'year' => 2026,
    ]);
});

it('can update a need group', function () {
    $group = NeedGroup::factory()->create(['name' => 'Old Name']);

    $data = [
        'name' => 'Updated Name',
        'year' => 2027,
        'is_active' => false,
    ];

    $response = $this->patch(route('need-groups.update', $group), $data);

    $response->assertRedirect();
    $group->refresh();
    expect($group->name)->toBe('Updated Name')
        ->and($group->is_active)->toBeFalse();
});

it('can delete a need group', function () {
    $group = NeedGroup::factory()->create();

    $response = $this->delete(route('need-groups.destroy', $group));

    $response->assertRedirect();
    $this->assertSoftDeleted('need_groups', ['id' => $group->id]);
});
