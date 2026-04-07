<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(999)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            OrganizationalUnitSeeder::class,
            NeedTypeSeeder::class,
            // RenstraSeeder::class,
            // TujuanSeeder::class,
            RenstraRSUDSeeder::class,
            NeedGroupSeeder::class,
            StrategicServicePlanSeeder::class,
            ChecklistQuestionSeeder::class,
            NeedChecklistAnswerSeeder::class,
        ]);
    }
}
