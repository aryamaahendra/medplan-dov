<?php

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('OrganizationalUnit has needs relationship', function () {
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();
    $needGroup = NeedGroup::factory()->create();

    $need = Need::factory()->create([
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
        'need_group_id' => $needGroup->id,
    ]);

    expect($unit->needs)->toHaveCount(1)
        ->and($unit->needs->first()->id)->toBe($need->id);
});

test('GET /management/organizational-units with trash=true delivers only trashed units with actor capabilities', function () {
    $admin = User::factory()->create();
    $admin->givePermissionTo(['view any org-units', 'restore org-units', 'force-delete org-units']);

    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Active Department']);
    $parentUnit = OrganizationalUnit::factory()->create(['name' => 'Parent Dept']);
    $trashedUnit = OrganizationalUnit::factory()->create([
        'name' => 'Trashed Department',
        'parent_id' => $parentUnit->id,
    ]);
    $trashedUnit->delete();

    $response = $this->actingAs($admin)
        ->get(route('organizational-units.index', ['trash' => 'true']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('management/organizational-units/index')
        ->where('filters.trash', true)
        ->has('units.data', 1)
        ->where('units.data.0.id', $trashedUnit->id)
        ->where('units.data.0.name', 'Trashed Department')
        ->where('units.data.0.parent.name', 'Parent Dept')
        ->has('units.data.0.deleted_at')
        ->where('units.data.0.can.restore', true)
        ->where('units.data.0.can.forceDelete', true)
    );
});

test('active unit dropdown allUnits excludes soft-deleted records in both active and trash mode', function () {
    $admin = User::factory()->create();
    $admin->givePermissionTo('view any org-units');

    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Active Dept']);
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Trashed Dept']);
    $trashedUnit->delete();

    // Active mode
    $response = $this->actingAs($admin)->get(route('organizational-units.index'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('allUnits', 1)
        ->where('allUnits.0.id', $activeUnit->id)
    );

    // Trash mode
    $responseTrash = $this->actingAs($admin)->get(route('organizational-units.index', ['trash' => 'true']));
    $responseTrash->assertOk();
    $responseTrash->assertInertia(fn (Assert $page) => $page
        ->has('allUnits', 1)
        ->where('allUnits.0.id', $activeUnit->id)
    );
});

test('POST /management/organizational-units/{id}/restore restores soft-deleted unit when parent isActive', function () {
    $admin = User::factory()->create();
    $admin->givePermissionTo('restore org-units');

    $parentUnit = OrganizationalUnit::factory()->create(['name' => 'Active Parent']);
    $trashedUnit = OrganizationalUnit::factory()->create([
        'name' => 'Child Dept',
        'parent_id' => $parentUnit->id,
    ]);
    $trashedUnit->delete();

    expect($trashedUnit->fresh()->trashed())->toBeTrue();

    $response = $this->actingAs($admin)
        ->post(route('organizational-units.restore', $trashedUnit->id));

    $response->assertRedirect(route('organizational-units.index'));
    $response->assertSessionHas('success');

    $restored = $trashedUnit->fresh();
    expect($restored->trashed())->toBeFalse()
        ->and($restored->parent_id)->toBe($parentUnit->id);
});

test('POST /management/organizational-units/{id}/restore detaches parent if parent unit is also soft-deleted', function () {
    $admin = User::factory()->create();
    $admin->givePermissionTo('restore org-units');

    $parentUnit = OrganizationalUnit::factory()->create(['name' => 'Trashed Parent']);
    $trashedUnit = OrganizationalUnit::factory()->create([
        'name' => 'Child Dept',
        'parent_id' => $parentUnit->id,
    ]);
    $trashedUnit->delete();
    $parentUnit->delete();

    $response = $this->actingAs($admin)
        ->post(route('organizational-units.restore', $trashedUnit->id));

    $response->assertRedirect(route('organizational-units.index'));
    $response->assertSessionHas('success');

    $restored = $trashedUnit->fresh();
    expect($restored->trashed())->toBeFalse()
        ->and($restored->parent_id)->toBeNull();
});

test('POST /management/organizational-units/{id}/restore requires restore permission', function () {
    $userWithoutPermission = User::factory()->create();
    $trashedUnit = OrganizationalUnit::factory()->create();
    $trashedUnit->delete();

    $response = $this->actingAs($userWithoutPermission)
        ->post(route('organizational-units.restore', $trashedUnit->id));

    $response->assertForbidden();
});

test('DELETE /management/organizational-units/{id}/force permanently deletes clean trashed unit', function () {
    $admin = User::factory()->create();
    $admin->givePermissionTo('force-delete org-units');

    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'To Purge']);
    $trashedUnit->delete();

    $response = $this->actingAs($admin)
        ->delete(route('organizational-units.force-delete', $trashedUnit->id));

    $response->assertRedirect(route('organizational-units.index'));
    $response->assertSessionHas('success');

    $this->assertDatabaseMissing('organizational_units', ['id' => $trashedUnit->id]);
});

test('DELETE /management/organizational-units/{id}/force rejected with 422 if unit has historical needs', function () {
    $admin = User::factory()->create();
    $admin->givePermissionTo('force-delete org-units');

    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Has Needs']);
    $needType = NeedType::factory()->create();
    $needGroup = NeedGroup::factory()->create();
    Need::factory()->create([
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $needType->id,
        'need_group_id' => $needGroup->id,
    ]);
    $trashedUnit->delete();

    $response = $this->actingAs($admin)
        ->deleteJson(route('organizational-units.force-delete', $trashedUnit->id));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['error']);
    $this->assertDatabaseHas('organizational_units', ['id' => $trashedUnit->id]);
});

test('DELETE /management/organizational-units/{id}/force rejected with 422 if unit has assigned users', function () {
    $admin = User::factory()->create();
    $admin->givePermissionTo('force-delete org-units');

    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Has Users']);
    User::factory()->create(['organizational_unit_id' => $trashedUnit->id]);
    $trashedUnit->delete();

    $response = $this->actingAs($admin)
        ->deleteJson(route('organizational-units.force-delete', $trashedUnit->id));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['error']);
    $this->assertDatabaseHas('organizational_units', ['id' => $trashedUnit->id]);
});

test('DELETE /management/organizational-units/{id}/force requires forceDelete permission', function () {
    $userWithoutPermission = User::factory()->create();
    $trashedUnit = OrganizationalUnit::factory()->create();
    $trashedUnit->delete();

    $response = $this->actingAs($userWithoutPermission)
        ->delete(route('organizational-units.force-delete', $trashedUnit->id));

    $response->assertForbidden();
});
