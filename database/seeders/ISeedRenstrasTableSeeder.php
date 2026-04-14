<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedRenstrasTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('renstras')->delete();

        \DB::table('renstras')->insert([
            0 => [
                'id' => 1,
                'name' => 'Renstra RSUD 2025-2030',
                'year_start' => 2025,
                'year_end' => 2030,
                'description' => 'Rencana Strategis RSUD Tahunan 2025-2030',
                'is_active' => true,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
        ]);

    }
}
