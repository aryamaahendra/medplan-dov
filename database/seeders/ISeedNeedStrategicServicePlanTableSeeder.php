<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedNeedStrategicServicePlanTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('need_strategic_service_plan')->delete();

        \DB::table('need_strategic_service_plan')->insert([
            0 => [
                'id' => 1,
                'need_id' => 1,
                'strategic_service_plan_id' => 4,
                'created_at' => null,
                'updated_at' => null,
            ],
        ]);

    }
}
