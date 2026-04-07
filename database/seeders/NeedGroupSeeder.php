<?php

namespace Database\Seeders;

use App\Models\NeedGroup;
use Illuminate\Database\Seeder;

class NeedGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        NeedGroup::factory(5)->create();
    }
}
