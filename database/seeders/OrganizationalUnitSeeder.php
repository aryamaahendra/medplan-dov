<?php

namespace Database\Seeders;

use App\Models\OrganizationalUnit;
use Illuminate\Database\Seeder;

class OrganizationalUnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $topLevelUnits = OrganizationalUnit::factory(5)->create();

        foreach ($topLevelUnits as $parent) {
            OrganizationalUnit::factory(rand(2, 4))->create([
                'parent_id' => $parent->id,
            ]);
        }
    }
}
