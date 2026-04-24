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
            'view descendant needs' => 'Melihat usulan kebutuhan milik unit sendiri dan unit bawahannya',
            'view needs' => 'Melihat detail usulan kebutuhan unit sendiri',

            'create any needs' => 'Membuat usulan kebutuhan untuk semua unit',
            'create descendant needs' => 'Membuat usulan kebutuhan untuk unit sendiri dan unit bawahannya',
            'create needs' => 'Membuat usulan kebutuhan untuk unit sendiri',

            'update any needs' => 'Mengubah semua usulan kebutuhan',
            'update descendant needs' => 'Mengubah usulan kebutuhan milik unit sendiri dan unit bawahannya',
            'update needs' => 'Mengubah usulan kebutuhan milik unit sendiri',

            'delete any needs' => 'Menghapus semua usulan kebutuhan',
            'delete descendant needs' => 'Menghapus usulan kebutuhan milik unit sendiri dan unit bawahannya',
            'delete needs' => 'Menghapus usulan kebutuhan milik unit sendiri',

            'approve any needs' => 'Menyetujui semua usulan kebutuhan',
            'approve descendant needs' => 'Menyetujui usulan kebutuhan milik unit sendiri dan unit bawahannya',
            'approve needs' => 'Menyetujui usulan kebutuhan milik unit sendiri',

            'restore any needs' => 'Mengembalikan semua usulan kebutuhan yang terhapus',
            'restore descendant needs' => 'Mengembalikan usulan kebutuhan milik unit sendiri dan bawahannya yang terhapus',
            'restore needs' => 'Mengembalikan usulan kebutuhan milik unit sendiri yang terhapus',

            'force-delete any needs' => 'Menghapus permanen semua usulan kebutuhan',
            'force-delete descendant needs' => 'Menghapus permanen usulan kebutuhan milik unit sendiri dan bawahannya',
            'force-delete needs' => 'Menghapus permanen usulan kebutuhan milik unit sendiri',

            // Need Tabs Visibility
            'view need tab general' => 'Melihat tab Informasi Umum pada usulan',
            'view need tab urgency' => 'Melihat tab Urgensi & Status pada usulan',
            'view need tab strategic' => 'Melihat tab Renstra pada usulan',
            'view need tab ikk' => 'Melihat tab IKK pada usulan',
            'view need tab rls' => 'Melihat tab RLS pada usulan',
            'view need tab planning' => 'Melihat tab Perencanaan pada usulan',
            'view need tab detail' => 'Melihat tab Detail KAK pada usulan',
            'view need tab lampiran' => 'Melihat tab Lampiran pada usulan',
            'view need tab checklist' => 'Melihat tab Checklist pada usulan',

            // Need Tabs Editing
            'update need tab general' => 'Mengubah data pada tab Informasi Umum',
            'update need tab urgency' => 'Mengubah data pada tab Urgensi & Status',
            'update need tab strategic' => 'Mengubah data pada tab Renstra',
            'update need tab ikk' => 'Mengubah data pada tab IKK',
            'update need tab rls' => 'Mengubah data pada tab RLS',
            'update need tab planning' => 'Mengubah data pada tab Perencanaan',
            'update need tab detail' => 'Mengubah data pada tab Detail KAK',
            'update need tab lampiran' => 'Mengubah data pada tab Lampiran',

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
        $plannerRole->syncPermissions(array_merge(array_keys($permissions), [
            'update any needs', 'delete any needs',
        ]));

        // Unit Head
        $unitHeadRole = Role::firstOrCreate(['name' => UserRole::UnitHead->value, 'guard_name' => 'web']);
        $unitHeadRole->syncPermissions([
            'view descendant needs', 'create descendant needs', 'update descendant needs', 'delete descendant needs', 'approve descendant needs',
            'view need tab general', 'view need tab urgency', 'view need tab strategic',
            'view need tab ikk', 'view need tab rls', 'view need tab planning',
            'view need tab detail', 'view need tab lampiran', 'view need tab checklist',
            'update need tab general', 'update need tab urgency', 'update need tab strategic',
            'update need tab ikk', 'update need tab rls', 'update need tab planning',
            'update need tab detail', 'update need tab lampiran',
        ]);

        // Staff
        $staffRole = Role::firstOrCreate(['name' => UserRole::Staff->value, 'guard_name' => 'web']);
        $staffRole->syncPermissions([
            'view needs', 'create needs', 'update needs',
            'view need tab general', 'view need tab urgency', 'view need tab strategic',
            'view need tab ikk', 'view need tab rls', 'view need tab planning',
            'view need tab detail', 'view need tab lampiran', 'view need tab checklist',
            'update need tab general', 'update need tab detail', 'update need tab lampiran',
        ]);
    }
}
