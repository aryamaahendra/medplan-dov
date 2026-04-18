<?php

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->unitA = OrganizationalUnit::factory()->create(['name' => 'Unit A']);
    $this->unitB = OrganizationalUnit::factory()->create(['name' => 'Unit B']);

    $this->needGroup = NeedGroup::factory()->create(['is_active' => true, 'year' => 2026]);

    $this->superAdmin = User::factory()->create(['organizational_unit_id' => $this->unitA->id]);
    $this->superAdmin->assignRole('super-admin');

    $this->admin = User::factory()->create(['organizational_unit_id' => $this->unitA->id]);
    $this->admin->assignRole('admin');

    $this->staffA = User::factory()->create(['organizational_unit_id' => $this->unitA->id]);
    $this->staffA->assignRole('staff');

    $this->staffB = User::factory()->create(['organizational_unit_id' => $this->unitB->id]);
    $this->staffB->assignRole('staff');
});

test('super admin can see all needs', function () {
    $needA = Need::factory()->create(['organizational_unit_id' => $this->unitA->id, 'need_group_id' => $this->needGroup->id]);
    $needB = Need::factory()->create(['organizational_unit_id' => $this->unitB->id, 'need_group_id' => $this->needGroup->id]);

    $response = $this->actingAs($this->superAdmin)->get(route('needs.index', ['need_group_id' => $this->needGroup->id]));

    $response->assertStatus(200);
    // Note: In Inertia, we'd check props, but basic 200 is a good start for controller authorization
});

test('staff can only see needs from their unit', function () {
    $needA = Need::factory()->create(['organizational_unit_id' => $this->unitA->id, 'title' => 'Need Unit A', 'need_group_id' => $this->needGroup->id]);
    $needB = Need::factory()->create(['organizational_unit_id' => $this->unitB->id, 'title' => 'Need Unit B', 'need_group_id' => $this->needGroup->id]);

    $response = $this->actingAs($this->staffA)->get(route('needs.index', ['need_group_id' => $this->needGroup->id]));

    $response->assertStatus(200);

    // Check scoping via Inertia props if possible, or just verify the policy directly
    expect(Need::indexScope($this->staffA)->count())->toBe(1);
    expect(Need::indexScope($this->staffA)->first()->id)->toBe($needA->id);
});

test('staff cannot view need from another unit', function () {
    $needB = Need::factory()->create(['organizational_unit_id' => $this->unitB->id]);

    $response = $this->actingAs($this->staffA)->get(route('needs.show', $needB));

    $response->assertStatus(403);
});

test('staff can view their own unit need', function () {
    $needA = Need::factory()->create(['organizational_unit_id' => $this->unitA->id]);

    $response = $this->actingAs($this->staffA)->get(route('needs.show', $needA));

    $response->assertStatus(200);
});

test('admin can view any need', function () {
    $needB = Need::factory()->create(['organizational_unit_id' => $this->unitB->id]);

    $response = $this->actingAs($this->admin)->get(route('needs.show', $needB));

    $response->assertStatus(200);
});

test('staff cannot access user management', function () {
    $response = $this->actingAs($this->staffA)->get(route('users.index'));

    $response->assertStatus(403);
});

test('admin can access user management', function () {
    $response = $this->actingAs($this->admin)->get(route('users.index'));

    $response->assertStatus(200);
});

test('staff cannot delete their own need if they only have create/update permissions', function () {
    // According to seeder, staff has: view any needs, view needs, create needs, update needs
    // They do NOT have delete needs.
    $needA = Need::factory()->create(['organizational_unit_id' => $this->unitA->id]);

    $response = $this->actingAs($this->staffA)->delete(route('needs.destroy', $needA));

    $response->assertStatus(403);
});

test('unit head can delete their own unit need', function () {
    $unitHeadA = User::factory()->create(['organizational_unit_id' => $this->unitA->id]);
    $unitHeadA->assignRole('unit-head');

    $needA = Need::factory()->create(['organizational_unit_id' => $this->unitA->id]);

    $response = $this->actingAs($unitHeadA)->delete(route('needs.destroy', $needA));

    $response->assertRedirect();
});

test('super admin can access role management', function () {
    $response = $this->actingAs($this->superAdmin)->get(route('roles.index'));

    $response->assertStatus(200);
});

test('super admin can access permission management', function () {
    $response = $this->actingAs($this->superAdmin)->get(route('permissions.index'));

    $response->assertStatus(200);
});
