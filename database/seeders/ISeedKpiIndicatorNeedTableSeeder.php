<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedKpiIndicatorNeedTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('kpi_indicator_need')->delete();
        Schema::enableForeignKeyConstraints();

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

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('kpi_indicator_need', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM kpi_indicator_need;");
        }
    }
}
