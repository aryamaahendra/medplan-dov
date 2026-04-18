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

        // Define permissions with descriptions
        $permissions = [
            // Users & Roles
            'view any users' => 'Melihat daftar semua pengguna',
            'create users' => 'Menambah pengguna baru',
            'update users' => 'Mengubah data pengguna',
            'delete users' => 'Menghapus pengguna',
            'view any roles' => 'Melihat daftar semua role',
            'create roles' => 'Menambah role baru',
            'update roles' => 'Mengubah data role dan permissionnya',
            'delete roles' => 'Menghapus role',
            'view any permissions' => 'Melihat daftar semua permission',
            'create permissions' => 'Menambah permission baru',
            'update permissions' => 'Mengubah data permission',
            'delete permissions' => 'Menghapus permission',

            // Organizational Units
            'view any org-units' => 'Melihat daftar semua unit organisasi',
            'create org-units' => 'Menambah unit organisasi baru',
            'update org-units' => 'Mengubah data unit organisasi',
            'delete org-units' => 'Menghapus unit organisasi',

            // Needs
            'view any needs' => 'Melihat daftar semua usulan kebutuhan',
            'view needs' => 'Melihat detail usulan kebutuhan',
            'create needs' => 'Membuat usulan kebutuhan baru',
            'update needs' => 'Mengubah usulan kebutuhan',
            'delete needs' => 'Menghapus usulan kebutuhan',
            'approve needs' => 'Menyetujui usulan kebutuhan',

            // Need Configuration
            'view any need-groups' => 'Melihat daftar semua grup usulan',
            'create need-groups' => 'Menambah grup usulan baru',
            'update need-groups' => 'Mengubah data grup usulan',
            'delete need-groups' => 'Menghapus grup usulan',
            'view any need-types' => 'Melihat daftar semua tipe usulan',
            'create need-types' => 'Menambah tipe usulan baru',
            'update need-types' => 'Mengubah data tipe usulan',
            'delete need-types' => 'Menghapus tipe usulan',
            'manage need-checklists' => 'Mengelola pertanyaan checklist untuk usulan',

            // Strategic Planning
            'manage renstras' => 'Mengelola data Renstra',
            'manage kpis' => 'Mengelola data IKK (Indikator Kinerja Kunci)',
            'manage plannings' => 'Mengelola data perencanaan (RKAT)',
            'manage ssp' => 'Mengelola Strategic Service Plan',
        ];

        foreach ($permissions as $name => $description) {
            Permission::updateOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['description' => $description]
            );
        }

        // Create roles and assign permissions

        // Super Admin - gets all permissions via Gate::before in a policy or AuthServiceProvider
        Role::firstOrCreate(['name' => UserRole::SuperAdmin->value, 'guard_name' => 'web']);

        // Admin
        $adminRole = Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
        $adminRole->syncPermissions(array_keys($permissions));

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
