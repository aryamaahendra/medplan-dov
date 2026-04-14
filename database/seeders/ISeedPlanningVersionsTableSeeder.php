<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedPlanningVersionsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('planning_versions')->delete();

        \DB::table('planning_versions')->insert([
            0 => [
                'id' => 2,
                'name' => 'SIPD RENSTRA',
                'year_start' => 2026,
                'year_end' => 2030,
                'revision_no' => 0,
                'status' => 'draft',
                'is_current' => false,
                'notes' => null,
                'created_at' => '2026-04-14 16:22:22',
                'updated_at' => '2026-04-14 16:22:22',
            ],
        ]);

    }
}
