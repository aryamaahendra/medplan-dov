<?php

namespace Database\Seeders;

use App\Models\KpiIndicator;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\StrategicServicePlan;
use Illuminate\Database\Seeder;

class NeedSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = OrganizationalUnit::all();
        $needTypes = NeedType::all();
        $groups = NeedGroup::all();

        if ($units->isEmpty() || $needTypes->isEmpty() || $groups->isEmpty()) {
            $this->command->warn('Skipping NeedSeeder: no OrganizationalUnits, NeedTypes, or NeedGroups found. Run their seeders first.');

            return;
        }

        $kpiIndicators = KpiIndicator::all();
        $servicePlans = StrategicServicePlan::all();

        $groups->each(function (NeedGroup $group) use ($units, $needTypes, $kpiIndicators, $servicePlans) {
            Need::factory()
                ->count(rand(2, 4))
                ->for($group)
                ->recycle($units)
                ->recycle($needTypes)
                ->create()
                ->each(function (Need $need) use ($kpiIndicators, $servicePlans) {
                    if ($kpiIndicators->isNotEmpty()) {
                        $need->kpiIndicators()->attach(
                            $kpiIndicators->random(rand(1, 3))->pluck('id')->toArray()
                        );
                    }

                    if ($servicePlans->isNotEmpty()) {
                        $need->strategicServicePlans()->attach(
                            $servicePlans->random(rand(1, 2))->pluck('id')->toArray()
                        );
                    }
                });
        });
    }
}
