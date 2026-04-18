<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedNeedStrategicServicePlanTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('need_strategic_service_plan')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('need_strategic_service_plan')->insert([

            0 => [
                'id' => 1,
                'need_id' => 1,
                'strategic_service_plan_id' => 4,
                'created_at' => null,
                'updated_at' => null,
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('need_strategic_service_plan', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM need_strategic_service_plan;");
        }
    }
}
