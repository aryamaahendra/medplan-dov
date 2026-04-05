<?php

namespace Database\Seeders;

use App\Models\KpiIndicator;
use App\Models\Need;
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
        $units = OrganizationalUnit::query()->pluck('id');
        $needTypes = NeedType::query()->pluck('id');

        if ($units->isEmpty() || $needTypes->isEmpty()) {
            $this->command->warn('Skipping NeedSeeder: no OrganizationalUnits or NeedTypes found. Run their seeders first.');

            return;
        }

        $kpiIndicators = KpiIndicator::all();
        $servicePlans = StrategicServicePlan::all();

        Need::factory()
            ->count(20)
            ->recycle(OrganizationalUnit::all())
            ->recycle(NeedType::all())
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
    }
}
