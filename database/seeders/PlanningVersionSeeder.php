<?php

namespace Database\Seeders;

use App\Models\PlanningActivityIndicator;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use App\Models\PlanningVersion;
use Illuminate\Database\Seeder;

class PlanningVersionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create a Version
        $version = PlanningVersion::create([
            'name' => 'Renstra 2025-2029 Murni',
            'year_start' => 2025,
            'year_end' => 2029,
            'revision_no' => 0,
            'status' => 'approved',
            'is_current' => true,
            'notes' => 'Five year strategic plan version',
        ]);

        // 2. Create initial activities directly in this Version
        $activities = [
            ['code' => '1', 'name' => 'Peningkatan Pelayanan Kesehatan', 'type' => 'program'],
            ['code' => '1.01', 'name' => 'Pengadaan Alat Kesehatan', 'type' => 'activity'],
            ['code' => '1.01.01', 'name' => 'Stetoskop Digital', 'type' => 'sub_activity'],
            ['code' => '1.01.01.01', 'name' => 'Output Stetoskop', 'type' => 'output'],
        ];

        $idMapping = [];

        foreach ($activities as $index => $data) {
            $parentCode = null;
            if ($data['type'] === 'activity') {
                $parentCode = '1';
            } elseif ($data['type'] === 'sub_activity') {
                $parentCode = '1.01';
            } elseif ($data['type'] === 'output') {
                $parentCode = '1.01.01';
            }

            $versionedActivity = PlanningActivityVersion::create([
                'planning_version_id' => $version->id,
                'parent_id' => $parentCode ? ($idMapping[$parentCode] ?? null) : null,
                'code' => $data['code'],
                'name' => $data['name'],
                'type' => $data['type'],
                'full_code' => $data['code'],
                'perangkat_daerah' => 'Dinas Kesehatan',
                'sort_order' => $index,
            ]);

            $idMapping[$data['code']] = $versionedActivity->id;

            // 3. Create Budget Data (Activity Level)
            for ($year = $version->year_start; $year <= $version->year_end; $year++) {
                PlanningActivityYear::create([
                    'yearable_id' => $versionedActivity->id,
                    'yearable_type' => PlanningActivityVersion::class,
                    'year' => $year,
                    'budget' => rand(100000000, 1000000000),
                ]);
            }

            // 4. Create Indicators
            $indicatorSpecs = [
                ['name' => 'Persentase '.$data['name'], 'unit' => '%'],
                ['name' => 'Jumlah output '.$data['name'], 'unit' => 'Unit'],
            ];

            foreach ($indicatorSpecs as $spec) {
                $indicator = PlanningActivityIndicator::create([
                    'planning_activity_version_id' => $versionedActivity->id,
                    'name' => $spec['name'],
                    'baseline' => (string) rand(50, 100),
                    'unit' => $spec['unit'],
                ]);

                // 5. Create Target Data (Indicator Level)
                for ($year = $version->year_start; $year <= $version->year_end; $year++) {
                    PlanningActivityYear::create([
                        'yearable_id' => $indicator->id,
                        'yearable_type' => PlanningActivityIndicator::class,
                        'year' => $year,
                        'target' => (string) rand(80, 100),
                    ]);
                }
            }
        }
    }
}
