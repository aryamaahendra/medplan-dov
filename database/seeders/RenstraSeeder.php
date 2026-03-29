<?php

namespace Database\Seeders;

use App\Models\Renstra;
use Illuminate\Database\Seeder;

class RenstraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Renstra::factory()->create([
            'name' => 'Renstra 2024-2029',
            'year_start' => 2024,
            'year_end' => 2029,
            'is_active' => true,
        ]);

        Renstra::factory()
            ->count(3)
            ->create();
    }
}
