<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions
        $permissions = [
            // Users & Roles
            'view any users', 'create users', 'update users', 'delete users',
            'view any roles', 'create roles', 'update roles', 'delete roles',
            'view any permissions', 'create permissions', 'update permissions', 'delete permissions',

            // Organizational Units
            'view any org-units', 'create org-units', 'update org-units', 'delete org-units',

            // Needs
            'view any needs', 'view needs', 'create needs', 'update needs', 'delete needs', 'approve needs',

            // Need Configuration
            'view any need-groups', 'create need-groups', 'update need-groups', 'delete need-groups',
            'view any need-types', 'create need-types', 'update need-types', 'delete need-types',
            'manage need-checklists',

            // Strategic Planning
            'manage renstras',
            'manage kpis',
            'manage plannings',
            'manage ssp',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles and assign permissions

        // Super Admin - gets all permissions via Gate::before in a policy or AuthServiceProvider
        Role::firstOrCreate(['name' => UserRole::SuperAdmin->value, 'guard_name' => 'web']);

        // Admin
        $adminRole = Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
        $adminRole->syncPermissions($permissions);

        // Planner
        $plannerRole = Role::firstOrCreate(['name' => UserRole::Planner->value, 'guard_name' => 'web']);
        $plannerRole->syncPermissions([
            'view any needs', 'view needs',
            'view any need-groups', 'view any need-types',
            'view any org-units',
            'manage renstras',
            'manage kpis',
            'manage plannings',
            'manage ssp',
        ]);

        // Unit Head
        $unitHeadRole = Role::firstOrCreate(['name' => UserRole::UnitHead->value, 'guard_name' => 'web']);
        $unitHeadRole->syncPermissions([
            'view any needs', 'view needs', 'create needs', 'update needs', 'delete needs',
        ]);

        // Staff
        $staffRole = Role::firstOrCreate(['name' => UserRole::Staff->value, 'guard_name' => 'web']);
        $staffRole->syncPermissions([
            'view any needs', 'view needs', 'create needs', 'update needs',
        ]);
    }
}
