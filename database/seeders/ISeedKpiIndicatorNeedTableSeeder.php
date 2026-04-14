<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedKpiIndicatorNeedTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('kpi_indicator_need')->delete();

        \DB::table('kpi_indicator_need')->insert([
            0 => [
                'id' => 1,
                'kpi_indicator_id' => 2,
                'need_id' => 1,
                'created_at' => null,
                'updated_at' => null,
            ],
            1 => [
                'id' => 2,
                'kpi_indicator_id' => 2,
                'need_id' => 2,
                'created_at' => null,
                'updated_at' => null,
            ],
            2 => [
                'id' => 3,
                'kpi_indicator_id' => 3,
                'need_id' => 3,
                'created_at' => null,
                'updated_at' => null,
            ],
        ]);

    }
}
