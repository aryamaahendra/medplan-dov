<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedUsersTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('users')->delete();

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

    }
}
