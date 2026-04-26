<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DummyDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            ISeedOrganizationalUnitsTableSeeder::class,
            ISeedNeedTypesTableSeeder::class,
            ISeedChecklistQuestionsTableSeeder::class,
            ISeedRenstrasTableSeeder::class,
            ISeedTujuansTableSeeder::class,
            ISeedSasaransTableSeeder::class,
            ISeedIndicatorsTableSeeder::class,
            ISeedIndicatorTargetsTableSeeder::class,
            ISeedKpiGroupsTableSeeder::class,
            ISeedKpiIndicatorsTableSeeder::class,
            ISeedKpiAnnualTargetsTableSeeder::class,
            ISeedStrategicServicePlansTableSeeder::class,
            UserSeeder::class,
            DummyRenstraSeeder::class,
            DummyNeedsSeeder::class,
        ]);
    }
}
