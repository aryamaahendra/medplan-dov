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

        // Delete obsolete coarse permissions
        $obsoletePermissions = [
            'manage need-checklists',
            'manage renstras',
            'manage kpis',
            'manage plannings',
            'manage ssp',
        ];
        Permission::whereIn('name', $obsoletePermissions)->delete();

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
            // Need Attachments
            'view need-attachments' => 'Melihat lampiran usulan',
            'create need-attachments' => 'Mengunggah lampiran baru ke usulan',
            'delete need-attachments' => 'Menghapus lampiran dari usulan',

            // Checklist Management
            'view any checklist-questions' => 'Melihat daftar pertanyaan checklist',
            'create checklist-questions' => 'Menambah pertanyaan checklist baru',
            'update checklist-questions' => 'Mengubah pertanyaan checklist',
            'delete checklist-questions' => 'Menghapus pertanyaan checklist',

            // KPI Management
            'view any kpi-groups' => 'Melihat daftar KPI Group',
            'create kpi-groups' => 'Menambah KPI Group baru',
            'update kpi-groups' => 'Mengubah data KPI Group',
            'delete kpi-groups' => 'Menghapus KPI Group',
            'view any kpi-indicators' => 'Melihat daftar Indikator KPI',
            'create kpi-indicators' => 'Menambah Indikator KPI baru',
            'update kpi-indicators' => 'Mengubah data Indikator KPI',
            'delete kpi-indicators' => 'Menghapus Indikator KPI',
            'view any kpi-targets' => 'Melihat target tahunan IKK',
            'create kpi-targets' => 'Menambah target tahunan IKK',
            'update kpi-targets' => 'Mengubah target tahunan IKK',
            'delete kpi-targets' => 'Menghapus target tahunan IKK',

            // Planning Management
            'view any planning-versions' => 'Melihat daftar versi perencanaan',
            'create planning-versions' => 'Menambah versi perencanaan baru',
            'update planning-versions' => 'Mengubah versi perencanaan',
            'delete planning-versions' => 'Menghapus versi perencanaan',
            'view any planning-activity-versions' => 'Melihat daftar aktivitas perencanaan',
            'create planning-activity-versions' => 'Menambah aktivitas perencanaan baru',
            'update planning-activity-versions' => 'Mengubah aktivitas perencanaan',
            'delete planning-activity-versions' => 'Menghapus aktivitas perencanaan',

            // Renstra Management
            'view any renstras' => 'Melihat daftar Renstra',
            'create renstras' => 'Menambah Renstra baru',
            'update renstras' => 'Mengubah data Renstra',
            'delete renstras' => 'Menghapus Renstra',
            'view any tujuans' => 'Melihat daftar Tujuan Renstra',
            'create tujuans' => 'Menambah Tujuan Renstra baru',
            'update tujuans' => 'Mengubah data Tujuan Renstra',
            'delete tujuans' => 'Menghapus Tujuan Renstra',
            'view any sasarans' => 'Melihat daftar Sasaran Renstra',
            'create sasarans' => 'Menambah Sasaran Renstra baru',
            'update sasarans' => 'Mengubah data Sasaran Renstra',
            'delete sasarans' => 'Menghapus Sasaran Renstra',
            'view any indicators' => 'Melihat daftar Indikator Renstra',
            'create indicators' => 'Menambah Indikator Renstra baru',
            'update indicators' => 'Mengubah data Indikator Renstra',
            'delete indicators' => 'Menghapus Indikator Renstra',

            // SSP Management
            'view any ssps' => 'Melihat daftar Strategic Service Plan',
            'create ssps' => 'Menambah Strategic Service Plan baru',
            'update ssps' => 'Mengubah Strategic Service Plan',
            'delete ssps' => 'Menghapus Strategic Service Plan',
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

        // Director
        $directorRole = Role::firstOrCreate(['name' => UserRole::Director->value, 'guard_name' => 'web']);
        $directorPermissions = array_filter(array_keys($permissions), function ($permission) {
            // Read-only everything except user, role, permissions
            $isRead = str_starts_with($permission, 'view');
            $isAuthRelated = str_contains($permission, 'user') || str_contains($permission, 'role') || str_contains($permission, 'permission');

            return $isRead && ! $isAuthRelated;
        });
        $directorRole->syncPermissions($directorPermissions);

        // Planner
        $plannerRole = Role::firstOrCreate(['name' => UserRole::Planner->value, 'guard_name' => 'web']);
        $plannerPermissions = array_filter(array_keys($permissions), function ($permission) {
            // Everything except manage user, role, permissions
            $isAuthRelated = str_contains($permission, 'user') || str_contains($permission, 'role') || str_contains($permission, 'permission');

            return ! $isAuthRelated;
        });
        $plannerRole->syncPermissions($plannerPermissions);

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
            'view need-attachments', 'create need-attachments', 'delete need-attachments',
        ]);

        // Staff
        $staffRole = Role::firstOrCreate(['name' => UserRole::Staff->value, 'guard_name' => 'web']);
        $staffRole->syncPermissions([
            'view needs', 'create needs', 'update needs',
            'view need tab general', 'view need tab urgency', 'view need tab strategic',
            'view need tab ikk', 'view need tab rls', 'view need tab planning',
            'view need tab detail', 'view need tab lampiran', 'view need tab checklist',
            'update need tab general', 'update need tab detail', 'update need tab lampiran',
            'view need-attachments', 'create need-attachments',
        ]);
    }
}
