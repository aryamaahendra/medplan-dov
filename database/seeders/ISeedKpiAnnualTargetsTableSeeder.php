<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedKpiAnnualTargetsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('kpi_annual_targets')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('kpi_annual_targets')->insert([

            0 => [
                'id' => 1,
                'indicator_id' => 2,
                'year' => 2025,
                'target_value' => '88',
                'created_at' => '2026-04-13 11:32:05',
                'updated_at' => '2026-04-13 11:32:05',
            ],
            1 => [
                'id' => 2,
                'indicator_id' => 2,
                'year' => 2026,
                'target_value' => '90',
                'created_at' => '2026-04-13 11:32:05',
                'updated_at' => '2026-04-13 11:32:05',
            ],
            2 => [
                'id' => 3,
                'indicator_id' => 2,
                'year' => 2027,
                'target_value' => '92',
                'created_at' => '2026-04-13 11:32:05',
                'updated_at' => '2026-04-13 11:32:05',
            ],
            3 => [
                'id' => 4,
                'indicator_id' => 2,
                'year' => 2028,
                'target_value' => '94',
                'created_at' => '2026-04-13 11:32:05',
                'updated_at' => '2026-04-13 11:32:05',
            ],
            4 => [
                'id' => 5,
                'indicator_id' => 2,
                'year' => 2029,
                'target_value' => '96',
                'created_at' => '2026-04-13 11:32:05',
                'updated_at' => '2026-04-13 11:32:05',
            ],
            5 => [
                'id' => 6,
                'indicator_id' => 2,
                'year' => 2030,
                'target_value' => '98',
                'created_at' => '2026-04-13 11:32:05',
                'updated_at' => '2026-04-13 11:32:05',
            ],
            6 => [
                'id' => 7,
                'indicator_id' => 3,
                'year' => 2025,
                'target_value' => '100',
                'created_at' => '2026-04-13 11:32:56',
                'updated_at' => '2026-04-13 11:32:56',
            ],
            7 => [
                'id' => 8,
                'indicator_id' => 3,
                'year' => 2026,
                'target_value' => '100',
                'created_at' => '2026-04-13 11:32:56',
                'updated_at' => '2026-04-13 11:32:56',
            ],
            8 => [
                'id' => 9,
                'indicator_id' => 3,
                'year' => 2027,
                'target_value' => '100',
                'created_at' => '2026-04-13 11:32:56',
                'updated_at' => '2026-04-13 11:32:56',
            ],
            9 => [
                'id' => 10,
                'indicator_id' => 3,
                'year' => 2028,
                'target_value' => '100',
                'created_at' => '2026-04-13 11:32:56',
                'updated_at' => '2026-04-13 11:32:56',
            ],
            10 => [
                'id' => 11,
                'indicator_id' => 3,
                'year' => 2029,
                'target_value' => '100',
                'created_at' => '2026-04-13 11:32:56',
                'updated_at' => '2026-04-13 11:32:56',
            ],
            11 => [
                'id' => 12,
                'indicator_id' => 3,
                'year' => 2030,
                'target_value' => '100',
                'created_at' => '2026-04-13 11:32:56',
                'updated_at' => '2026-04-13 11:32:56',
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('kpi_annual_targets', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM kpi_annual_targets;");
        }
    }
}
