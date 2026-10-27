<?php

declare(strict_types=1);

use App\Actions\Management\GroupPermissionsAction;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->unit = OrganizationalUnit::factory()->create(['name' => 'IT Unit']);

    $this->superAdmin = User::factory()->create(['organizational_unit_id' => $this->unit->id]);
    $this->superAdmin->assignRole('super-admin');

    $this->plannerUser = User::factory()->create(['organizational_unit_id' => $this->unit->id]);
    $this->plannerUser->assignRole('planner');
});

test('group permissions action organizes all permissions into non-empty groups', function () {
    $permissions = Permission::all();
    $action = app(GroupPermissionsAction::class);
    $grouped = $action->handle($permissions);
    expect($grouped)->not()->toBeEmpty();

    $totalGroupedPermissions = array_sum(array_map(fn ($g) => count($g['permissions']), $grouped));
    expect($totalGroupedPermissions)->toBe($permissions->count());
});

test('super admin can view roles index with matrix props', function () {
    $response = $this->actingAs($this->superAdmin)->get(route('roles.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('management/roles/index')
        ->has('roles')
        ->has('groupedPermissions')
        ->has('currentUserRoleIds')
    );
});

test('super admin can batch update role permissions matrix', function () {
    $plannerRole = Role::findByName('planner');
    $perm1 = Permission::first();
    $perm2 = Permission::skip(1)->first();

    $response = $this->actingAs($this->superAdmin)->put(route('roles.matrix.update'), [
        'matrix' => [
            $plannerRole->id => [$perm1->id, $perm2->id],
        ],
    ]);

    $response->assertRedirect(route('roles.index'));
    $response->assertSessionHas('success');

    $plannerRole->refresh();
    expect($plannerRole->hasPermissionTo($perm1->name))->toBeTrue();
    expect($plannerRole->hasPermissionTo($perm2->name))->toBeTrue();
});

test('cannot delete role when active users are assigned', function () {
    $plannerRole = Role::findByName('planner');

    $response = $this->actingAs($this->superAdmin)->delete(route('roles.destroy', $plannerRole));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    expect(Role::where('id', $plannerRole->id)->exists())->toBeTrue();
});

test('can delete custom role when no users are assigned', function () {
    $customRole = Role::create(['name' => 'temp-auditor']);

    $response = $this->actingAs($this->superAdmin)->delete(route('roles.destroy', $customRole));

    $response->assertRedirect(route('roles.index'));
    $response->assertSessionHas('success');
    expect(Role::where('id', $customRole->id)->exists())->toBeFalse();
});

test('cannot delete super-admin role', function () {
    $superAdminRole = Role::findByName('super-admin');

    $response = $this->actingAs($this->superAdmin)->delete(route('roles.destroy', $superAdminRole));

    $response->assertRedirect();
    $response->assertSessionHas('error');
    expect(Role::where('id', $superAdminRole->id)->exists())->toBeTrue();
});

test('non super-admin user cannot self-lockout by revoking role management permissions from own role', function () {
    // Give planner role permissions to view and update roles
    $plannerRole = Role::findByName('planner');
    $plannerRole->givePermissionTo(['view any roles', 'update roles']);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $user = User::find($this->plannerUser->id);

    $response = $this->actingAs($user)->put(route('roles.matrix.update'), [
        'matrix' => [
            $plannerRole->id => [], // Strip all permissions
        ],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');
});
