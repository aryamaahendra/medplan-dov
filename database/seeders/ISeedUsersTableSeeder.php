<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedUsersTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('users')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('users')->insert([

            0 => [
                'id' => 1,
                'name' => 'Test User',
                'email' => 'test@example.com',
                'email_verified_at' => '2026-04-13 10:45:06',
                'password' => '$2y$12$y8ZWYUnoMZK0ZxIhkTR6ke66hsdMR9tv1C.xGZAaUuocTjtibULCi',
                'remember_token' => 'mw6YACzrZfR4jtqytKCl7XKieI62FIl3tiqPn5ZVeiiLQaGkHCd03Kl7NKr8',
                'created_at' => '2026-04-13 10:45:06',
                'updated_at' => '2026-04-13 10:45:06',
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM users;");
        }

        // Assign default role to seeded users if RBAC is enabled
        $users = User::all();
        foreach ($users as $user) {
            if (! $user->hasAnyRole(UserRole::cases())) {
                $user->assignRole(UserRole::Staff->value);
            }
        }
    }
}
