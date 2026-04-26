<?php

namespace Database\Seeders;

use App\Models\Indicator;
use App\Models\IndicatorTarget;
use App\Models\KpiAnnualTarget;
use App\Models\KpiGroup;
use App\Models\KpiIndicator;
use App\Models\Renstra;
use App\Models\Sasaran;
use App\Models\StrategicServicePlan;
use App\Models\Tujuan;
use Illuminate\Database\Seeder;

class DummyRenstraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $oldRenstra = Renstra::find(1);
        if (! $oldRenstra) {
            return;
        }

        // Create new Renstra 2020-2024
        $newRenstra = Renstra::create([
            'name' => 'Renstra RSUD 2020-2024',
            'year_start' => 2020,
            'year_end' => 2024,
            'description' => 'Rencana Strategis RSUD Tahunan 2020-2024',
            'is_active' => false,
        ]);

        $tujuans = Tujuan::where('renstra_id', $oldRenstra->id)->get();

        foreach ($tujuans as $tujuan) {
            $newTujuan = Tujuan::create([
                'renstra_id' => $newRenstra->id,
                'name' => $tujuan->name,
                'description' => $tujuan->description,
            ]);

            // Indicators directly attached to Tujuan
            $tujuanIndicators = Indicator::where('tujuan_id', $tujuan->id)->get();
            foreach ($tujuanIndicators as $ind) {
                $newInd = Indicator::create([
                    'tujuan_id' => $newTujuan->id,
                    'sasaran_id' => null,
                    'name' => $ind->name,
                    'baseline' => $ind->baseline,
                    'description' => $ind->description,
                ]);
                $this->createTargets($ind, $newInd);
            }

            $sasarans = Sasaran::where('tujuan_id', $tujuan->id)->get();
            foreach ($sasarans as $sasaran) {
                $newSasaran = Sasaran::create([
                    'tujuan_id' => $newTujuan->id,
                    'name' => $sasaran->name,
                    'description' => $sasaran->description,
                ]);

                // Indicators attached to Sasaran
                $sasaranIndicators = Indicator::where('sasaran_id', $sasaran->id)->get();
                foreach ($sasaranIndicators as $ind) {
                    $newInd = Indicator::create([
                        'tujuan_id' => null,
                        'sasaran_id' => $newSasaran->id,
                        'name' => $ind->name,
                        'baseline' => $ind->baseline,
                        'description' => $ind->description,
                    ]);
                    $this->createTargets($ind, $newInd);
                }
            }
        }

        $this->createPastKpiTargets();
        $this->createPastStrategicPlans();
    }

    private function createTargets(Indicator $oldInd, Indicator $newInd): void
    {
        $baseTarget2025 = IndicatorTarget::where('indicator_id', $oldInd->id)->where('year', 2025)->first();
        $targetValue = $baseTarget2025 ? $baseTarget2025->target : '50';

        // simple modifier logic: if target is a number or percentage, reduce it slightly for previous years
        $isPercentage = str_ends_with($targetValue, '%');
        $numericValue = (float) rtrim($targetValue, '%');
        if ($numericValue == 0 && $targetValue !== '0' && $targetValue !== '0%') {
            // It's probably text like "Paripurna" or "5 MOU"
            for ($year = 2020; $year <= 2024; $year++) {
                IndicatorTarget::create([
                    'indicator_id' => $newInd->id,
                    'year' => $year,
                    'target' => $targetValue,
                ]);
            }

            return;
        }

        for ($year = 2020; $year <= 2024; $year++) {
            // e.g. 2020 -> 2025 - 5 years -> reduce by 5-10%
            $diff = 2025 - $year;
            $modVal = max(0, $numericValue - ($diff * 2)); // simple reduction

            $finalTarget = $isPercentage ? $modVal.'%' : (string) $modVal;

            IndicatorTarget::create([
                'indicator_id' => $newInd->id,
                'year' => $year,
                'target' => $finalTarget,
            ]);
        }
    }

    private function createPastKpiTargets(): void
    {
        // Must clone KpiGroup to avoid DB constraint error
        $oldGroups = KpiGroup::all();
        foreach ($oldGroups as $group) {
            $newGroup = KpiGroup::create([
                'name' => $group->name.' (Past)',
                'description' => $group->description,
                'start_year' => 2020,
                'end_year' => 2024,
                'is_active' => false,
            ]);

            $oldIndicators = KpiIndicator::where('group_id', $group->id)->whereNull('parent_indicator_id')->get();
            foreach ($oldIndicators as $parentKpiInd) {
                $newParent = KpiIndicator::create([
                    'group_id' => $newGroup->id,
                    'parent_indicator_id' => null,
                    'name' => $parentKpiInd->name,
                    'unit' => $parentKpiInd->unit,
                    'is_category' => $parentKpiInd->is_category,
                    'baseline_value' => $parentKpiInd->baseline_value,
                ]);

                $this->createPastKpiTargetsForIndicator($parentKpiInd, $newParent);

                $childIndicators = KpiIndicator::where('group_id', $group->id)->where('parent_indicator_id', $parentKpiInd->id)->get();
                foreach ($childIndicators as $childKpiInd) {
                    $newChild = KpiIndicator::create([
                        'group_id' => $newGroup->id,
                        'parent_indicator_id' => $newParent->id,
                        'name' => $childKpiInd->name,
                        'unit' => $childKpiInd->unit,
                        'is_category' => $childKpiInd->is_category,
                        'baseline_value' => $childKpiInd->baseline_value,
                    ]);

                    $this->createPastKpiTargetsForIndicator($childKpiInd, $newChild);
                }
            }
        }
    }

    private function createPastKpiTargetsForIndicator(KpiIndicator $oldKpiInd, KpiIndicator $newKpiInd): void
    {
        $baseTarget = KpiAnnualTarget::where('indicator_id', $oldKpiInd->id)->where('year', 2025)->first();
        if (! $baseTarget) {
            return;
        }

        $targetVal = $baseTarget->target_value;

        $numericVal = (float) $targetVal;
        if ($numericVal == 0 && $targetVal !== '0') {
            for ($year = 2020; $year <= 2024; $year++) {
                KpiAnnualTarget::create([
                    'indicator_id' => $newKpiInd->id,
                    'year' => $year,
                    'target_value' => $targetVal,
                ]);
            }

            return;
        }

        for ($year = 2020; $year <= 2024; $year++) {
            $diff = 2025 - $year;
            $modVal = max(0, $numericVal - ($diff * 2));

            KpiAnnualTarget::create([
                'indicator_id' => $newKpiInd->id,
                'year' => $year,
                'target_value' => (string) $modVal,
            ]);
        }
    }

    private function createPastStrategicPlans(): void
    {
        $plans = StrategicServicePlan::all();
        foreach ($plans as $plan) {
            if ($plan->year >= 2025) {
                StrategicServicePlan::create([
                    'year' => max(2020, $plan->year - 5),
                    'strategic_program' => $plan->strategic_program.' (Past)',
                    'service_plan' => $plan->service_plan.' (Past)',
                    'target' => $plan->target,
                    'policy_direction' => $plan->policy_direction,
                ]);
            }
        }
    }
}
