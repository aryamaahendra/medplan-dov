<?php

namespace Database\Seeders;

use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use App\Models\PlanningRevisionGroup;
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
            'name' => 'RKPD 2026 Murni',
            'fiscal_year' => 2026,
            'revision_no' => 0,
            'status' => 'approved',
            'is_current' => true,
            'notes' => 'Original planning version',
        ]);

        // 2. Create a Revision Group
        $group = PlanningRevisionGroup::create([
            'planning_version_id' => $version->id,
            'code' => 'ORG-2026',
            'name' => 'Original Setting',
        ]);

        // 3. Create initial activities directly in this Version
        $activities = [
            ['code' => '1', 'name' => 'Peningkatan Pelayanan Kesehatan', 'type' => 'program'],
            ['code' => '1.01', 'name' => 'Pengadaan Alat Kesehatan', 'type' => 'activity'],
            ['code' => '1.01.01', 'name' => 'Stetoskop Digital', 'type' => 'sub_activity'],
            ['code' => '1.01.01.01', 'name' => 'Output Stetoskop', 'type' => 'output'],
        ];

        $parentId = null;
        $idMapping = [];

        foreach ($activities as $data) {
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
                'revision_group_id' => $group->id,
                'parent_id' => $parentCode ? ($idMapping[$parentCode] ?? null) : null,
                'code' => $data['code'],
                'name' => $data['name'],
                'type' => $data['type'],
                'full_code' => $data['code'],
                'indicator_name' => 'Indicator for '.$data['name'],
                'indicator_baseline_2024' => rand(50, 100),
                'perangkat_daerah' => 'Dinas Kesehatan',
                'sort_order' => count($idMapping) + 1,
            ]);

            $idMapping[$data['code']] = $versionedActivity->id;

            // 4. Create Dynamic Year Rows (2026-2030)
            for ($year = 2026; $year <= 2030; $year++) {
                PlanningActivityYear::create([
                    'planning_activity_version_id' => $versionedActivity->id,
                    'year' => $year,
                    'target' => rand(80, 100).' %',
                    'budget' => rand(100000000, 1000000000),
                ]);
            }
        }
    }
}
