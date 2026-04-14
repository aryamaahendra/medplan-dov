<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedKpiIndicatorsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('kpi_indicators')->delete();

        \DB::table('kpi_indicators')->insert([
            0 => [
                'id' => 1,
                'group_id' => 1,
                'parent_indicator_id' => null,
                'name' => '1.02 - URUSAN PEMERINTAHAN BIDANG KESEHATAN',
                'unit' => null,
                'is_category' => true,
                'baseline_value' => null,
                'created_at' => '2026-04-13 11:26:56',
                'updated_at' => '2026-04-13 11:26:56',
            ],
            1 => [
                'id' => 2,
                'group_id' => 1,
                'parent_indicator_id' => 1,
                'name' => 'Nilai Indeks Kepuasan Masyarakat',
                'unit' => 'Angka',
                'is_category' => false,
                'baseline_value' => '86',
                'created_at' => '2026-04-13 11:32:05',
                'updated_at' => '2026-04-13 11:32:05',
            ],
            2 => [
                'id' => 3,
                'group_id' => 1,
                'parent_indicator_id' => 1,
                'name' => 'Presentase Ketersediaan Jenis Dokter Spesialis Sesuai Standar di Rumah sakit',
                'unit' => '%',
                'is_category' => false,
                'baseline_value' => '100',
                'created_at' => '2026-04-13 11:32:56',
                'updated_at' => '2026-04-13 11:32:56',
            ],
        ]);

    }
}
