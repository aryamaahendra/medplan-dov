<?php

namespace Database\Seeders;

use App\Models\KpiAnnualTarget;
use App\Models\KpiGroup;
use App\Models\KpiIndicator;
use Illuminate\Database\Seeder;

class KpiSchemaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create KPI Group
        $group = KpiGroup::create([
            'name' => 'Health Affairs Planning 2024–2030',
            'description' => 'Regional KPIs for health sector.',
            'start_year' => 2025,
            'end_year' => 2030,
            'is_active' => true,
        ]);

        // 2. Create Category Indicator
        $category = KpiIndicator::create([
            'group_id' => $group->id,
            'name' => 'Health Sector',
            'is_category' => true,
        ]);

        // 3. Create Indicators
        $indicator1 = KpiIndicator::create([
            'group_id' => $group->id,
            'parent_indicator_id' => $category->id,
            'name' => 'Community Satisfaction Index',
            'unit' => 'Score',
            'baseline_value' => '86',
        ]);

        $indicator2 = KpiIndicator::create([
            'group_id' => $group->id,
            'parent_indicator_id' => $category->id,
            'name' => 'Specialist Doctor Availability',
            'unit' => '%',
            'baseline_value' => '100',
        ]);

        // 4. Create Annual Targets for indicator1
        $targets1 = [
            2025 => '88', 2026 => '90', 2027 => '92',
            2028 => '94', 2029 => '96', 2030 => '98',
        ];

        foreach ($targets1 as $year => $value) {
            KpiAnnualTarget::create([
                'indicator_id' => $indicator1->id,
                'year' => $year,
                'target_value' => $value,
            ]);
        }

        // 5. Create Annual Targets for indicator2
        $targets2 = [
            2025 => '100', 2026 => '100', 2027 => '100',
            2028 => '100', 2029 => '100', 2030 => '100',
        ];

        foreach ($targets2 as $year => $value) {
            KpiAnnualTarget::create([
                'indicator_id' => $indicator2->id,
                'year' => $year,
                'target_value' => $value,
            ]);
        }
    }
}
