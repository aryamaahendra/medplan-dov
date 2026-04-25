<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Core Role Users
        $coreUsers = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@kabelota.com',
                'role' => UserRole::SuperAdmin,
            ],
            [
                'name' => 'Director',
                'email' => 'director@kabelota.com',
                'role' => UserRole::Director,
            ],
            [
                'name' => 'Planner',
                'email' => 'planner@kabelota.com',
                'role' => UserRole::Planner,
            ],
        ];

        foreach ($coreUsers as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'nip' => '1234567890'.rand(100, 999),
                ]
            );
            $user->syncRoles([$userData['role']->value]);
        }

        // 2. Create Unit-based Users
        $units = OrganizationalUnit::all();
        foreach ($units as $unit) {
            $hasChildren = $unit->children()->exists();
            $hasParent = $unit->parent_id !== null;

            if ($hasChildren) {
                // Unit Head
                $this->createUserForUnit($unit, UserRole::UnitHead);
            } elseif ($hasParent) {
                // Staff
                $this->createUserForUnit($unit, UserRole::Staff);
            }
        }
    }

    /**
     * Helper to create user for a specific unit and role.
     */
    private function createUserForUnit(OrganizationalUnit $unit, UserRole $role): void
    {
        $roleLabel = $role->label();
        // Create a clean email from unit code
        $cleanCode = strtolower(preg_replace('/[^a-zA-Z0-9]/', '.', $unit->code));
        $email = $cleanCode.'.'.$role->value.'@kabelota.com';

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $roleLabel.' '.$unit->name,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'organizational_unit_id' => $unit->id,
                'nip' => '19'.rand(70, 99).rand(10, 12).rand(10, 28).rand(1000, 9999),
            ]
        );

        $user->syncRoles([$role->value]);
    }
}
