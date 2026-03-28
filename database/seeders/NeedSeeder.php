<?php

namespace Database\Seeders;

use App\Models\Need;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
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

        Need::factory()
            ->count(20)
            ->recycle(OrganizationalUnit::all())
            ->recycle(NeedType::all())
            ->create();
    }
}
