<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedMigrationsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('migrations')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('migrations')->insert([

            0 => [
                'id' => 1,
                'migration' => '0001_01_01_000000_create_users_table',
                'batch' => 1,
            ],
            1 => [
                'id' => 2,
                'migration' => '0001_01_01_000001_create_cache_table',
                'batch' => 1,
            ],
            2 => [
                'id' => 3,
                'migration' => '0001_01_01_000002_create_jobs_table',
                'batch' => 1,
            ],
            3 => [
                'id' => 4,
                'migration' => '2025_08_14_170933_add_two_factor_columns_to_users_table',
                'batch' => 1,
            ],
            4 => [
                'id' => 5,
                'migration' => '2026_03_28_031617_create_organizational_units_table',
                'batch' => 1,
            ],
            5 => [
                'id' => 6,
                'migration' => '2026_03_28_050027_create_need_types_table',
                'batch' => 1,
            ],
            6 => [
                'id' => 7,
                'migration' => '2026_03_28_070024_create_needs_table',
                'batch' => 1,
            ],
            7 => [
                'id' => 8,
                'migration' => '2026_03_29_134849_create_renstras_table',
                'batch' => 1,
            ],
            8 => [
                'id' => 9,
                'migration' => '2026_03_29_135000_create_tujuans_table',
                'batch' => 1,
            ],
            9 => [
                'id' => 10,
                'migration' => '2026_03_29_142332_create_indicators_table',
                'batch' => 1,
            ],
            10 => [
                'id' => 11,
                'migration' => '2026_03_29_142333_create_indicator_targets_table',
                'batch' => 1,
            ],
            11 => [
                'id' => 12,
                'migration' => '2026_03_30_035549_create_sasarans_table',
                'batch' => 1,
            ],
            12 => [
                'id' => 13,
                'migration' => '2026_03_30_035612_update_indicators_table_add_sasaran_id',
                'batch' => 1,
            ],
            13 => [
                'id' => 14,
                'migration' => '2026_03_31_020114_add_priority_fields_to_needs_table',
                'batch' => 1,
            ],
            14 => [
                'id' => 15,
                'migration' => '2026_04_02_054018_create_need_sasaran_table',
                'batch' => 1,
            ],
            15 => [
                'id' => 16,
                'migration' => '2026_04_02_054019_create_need_indicator_table',
                'batch' => 1,
            ],
            16 => [
                'id' => 17,
                'migration' => '2026_04_02_171023_create_kpi_groups_table',
                'batch' => 1,
            ],
            17 => [
                'id' => 18,
                'migration' => '2026_04_02_171024_create_kpi_indicators_table',
                'batch' => 1,
            ],
            18 => [
                'id' => 19,
                'migration' => '2026_04_02_171025_create_kpi_annual_targets_table',
                'batch' => 1,
            ],
            19 => [
                'id' => 20,
                'migration' => '2026_04_05_055657_create_strategic_service_plans_table',
                'batch' => 1,
            ],
            20 => [
                'id' => 21,
                'migration' => '2026_04_05_151440_create_kpi_indicator_need_table',
                'batch' => 1,
            ],
            21 => [
                'id' => 22,
                'migration' => '2026_04_05_151714_create_need_strategic_service_plan_table',
                'batch' => 1,
            ],
            22 => [
                'id' => 23,
                'migration' => '2026_04_07_052208_create_need_groups_table',
                'batch' => 1,
            ],
            23 => [
                'id' => 24,
                'migration' => '2026_04_07_052317_add_need_group_id_to_needs_table',
                'batch' => 1,
            ],
            24 => [
                'id' => 25,
                'migration' => '2026_04_07_133747_create_checklist_questions_table',
                'batch' => 1,
            ],
            25 => [
                'id' => 26,
                'migration' => '2026_04_07_133759_create_need_checklist_answers_table',
                'batch' => 1,
            ],
            26 => [
                'id' => 27,
                'migration' => '2026_04_07_133900_create_need_group_checklist_question_table',
                'batch' => 1,
            ],
            27 => [
                'id' => 28,
                'migration' => '2026_04_09_075214_create_need_details_table',
                'batch' => 1,
            ],
            28 => [
                'id' => 29,
                'migration' => '2026_04_10_081519_create_planning_versions_table',
                'batch' => 1,
            ],
            29 => [
                'id' => 30,
                'migration' => '2026_04_10_081521_create_planning_activity_versions_table',
                'batch' => 1,
            ],
            30 => [
                'id' => 31,
                'migration' => '2026_04_10_081522_create_planning_activity_years_table',
                'batch' => 1,
            ],
            31 => [
                'id' => 32,
                'migration' => '2026_04_10_170810_create_planning_activity_indicators_table',
                'batch' => 1,
            ],
            32 => [
                'id' => 33,
                'migration' => '2026_04_12_170140_add_total_budget_to_planning_activity_years_table',
                'batch' => 1,
            ],
            33 => [
                'id' => 34,
                'migration' => '2026_04_14_060548_add_checklist_percentage_to_needs_table',
                'batch' => 2,
            ],
            34 => [
                'id' => 36,
                'migration' => '2026_04_14_065619_create_need_attachments_table',
                'batch' => 3,
            ],
            35 => [
                'id' => 37,
                'migration' => '2026_04_14_142944_add_notes_and_approval_to_needs_table',
                'batch' => 4,
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('migrations', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM migrations;");
        }
    }
}
