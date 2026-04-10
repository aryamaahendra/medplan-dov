<?php

namespace Database\Seeders;

use App\Models\PlanningActivity;
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
        // 1. Ensure we have some master activities
        if (PlanningActivity::count() === 0) {
            PlanningActivity::factory()->count(5)->create();
        }

        // 2. Create a Version
        $version = PlanningVersion::create([
            'name' => 'RKPD 2026 Murni',
            'fiscal_year' => 2026,
            'revision_no' => 0,
            'status' => 'approved',
            'is_current' => true,
            'notes' => 'Original planning version',
        ]);

        // 3. Create a Revision Group
        $group = PlanningRevisionGroup::create([
            'planning_version_id' => $version->id,
            'code' => 'ORG-2026',
            'name' => 'Original Setting',
        ]);

        // 4. Snapshot Master Activities into this Version
        $masterActivities = PlanningActivity::all();

        foreach ($masterActivities as $master) {
            $versionedActivity = PlanningActivityVersion::create([
                'planning_version_id' => $version->id,
                'revision_group_id' => $group->id,
                'source_activity_id' => $master->id,
                'code' => $master->code,
                'name' => $master->name,
                'type' => $master->type,
                'full_code' => $master->full_code,
                'indicator_name' => 'Indicator for '.$master->name,
                'indicator_baseline_2024' => rand(50, 100),
                'perangkat_daerah' => 'Dinas Kesehatan',
                'sort_order' => $master->id,
            ]);

            // 5. Create Dynamic Year Rows (2026-2030)
            for ($year = 2026; $year <= 2030; $year++) {
                PlanningActivityYear::create([
                    'planning_activity_version_id' => $versionedActivity->id,
                    'year' => $year,
                    'target' => rand(80, 100).' %',
                    'budget' => rand(500000000, 5000000000),
                ]);
            }
        }
    }
}
