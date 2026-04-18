<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedKpiGroupsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('kpi_groups')->delete();
        Schema::enableForeignKeyConstraints();

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

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('kpi_groups', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM kpi_groups;");
        }
    }
}
