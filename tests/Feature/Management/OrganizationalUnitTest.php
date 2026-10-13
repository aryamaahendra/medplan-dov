<?php

use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('RolesAndPermissionsSeeder seeds restore and force-delete org-units permissions', function () {
    $this->assertDatabaseHas('permissions', ['name' => 'restore org-units']);
    $this->assertDatabaseHas('permissions', ['name' => 'force-delete org-units']);
});

test('OrganizationalUnitPolicy checks restore permission', function () {
    $unit = OrganizationalUnit::factory()->create();
    $user = User::factory()->create();

    expect($user->can('restore', $unit))->toBeFalse();

    $user->givePermissionTo('restore org-units');
    expect($user->can('restore', $unit))->toBeTrue();
});

test('OrganizationalUnitPolicy checks forceDelete permission', function () {
    $unit = OrganizationalUnit::factory()->create();
    $user = User::factory()->create();

    expect($user->can('forceDelete', $unit))->toBeFalse();

    $user->givePermissionTo('force-delete org-units');
    expect($user->can('forceDelete', $unit))->toBeTrue();
});

test('super-admin bypasses OrganizationalUnitPolicy checks for restore and forceDelete', function () {
    $unit = OrganizationalUnit::factory()->create();
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super-admin');

    expect($superAdmin->can('restore', $unit))->toBeTrue()
        ->and($superAdmin->can('forceDelete', $unit))->toBeTrue();
});

test('OrganizationalUnit has users relationship', function () {
    $unit = OrganizationalUnit::factory()->create();
    $user = User::factory()->create(['organizational_unit_id' => $unit->id]);

    expect($unit->users)->toHaveCount(1)
        ->and($unit->users->first()->id)->toBe($user->id);
});

test('soft deletion fails with 422 if unit has active child units', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super-admin');

    $parent = OrganizationalUnit::factory()->create(['name' => 'Parent Unit']);
    $child = OrganizationalUnit::factory()->create(['parent_id' => $parent->id, 'name' => 'Child Unit']);

    $response = $this->actingAs($superAdmin)
        ->deleteJson(route('organizational-units.destroy', $parent));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['error']);

    $this->assertNotSoftDeleted($parent);
});

test('soft deletion fails with 422 if unit has active users assigned', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super-admin');

    $unit = OrganizationalUnit::factory()->create(['name' => 'Target Unit']);
    $user = User::factory()->create(['organizational_unit_id' => $unit->id]);

    $response = $this->actingAs($superAdmin)
        ->deleteJson(route('organizational-units.destroy', $unit));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['error']);

    $this->assertNotSoftDeleted($unit);
});

test('soft deletion succeeds when unit has no active child units and no active users', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super-admin');

    $unit = OrganizationalUnit::factory()->create(['name' => 'Leaf Unit']);

    $response = $this->actingAs($superAdmin)
        ->delete(route('organizational-units.destroy', $unit));

    $response->assertRedirect(route('organizational-units.index'))
        ->assertSessionHas('success', 'Unit organisasi berhasil dihapus.');

    $this->assertSoftDeleted($unit);
});
