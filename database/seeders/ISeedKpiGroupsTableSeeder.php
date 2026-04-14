<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedKpiGroupsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('kpi_groups')->delete();

        \DB::table('kpi_groups')->insert([
            0 => [
                'id' => 1,
                'name' => 'IKK',
                'description' => null,
                'start_year' => 2025,
                'end_year' => 2030,
                'is_active' => true,
                'created_at' => '2026-04-13 11:26:36',
                'updated_at' => '2026-04-13 11:30:18',
            ],
        ]);

    }
}
