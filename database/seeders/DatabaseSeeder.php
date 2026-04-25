<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        // System / Independent Parent Tables
        $this->call(ISeedOrganizationalUnitsTableSeeder::class);
        $this->call(ISeedNeedTypesTableSeeder::class);
        $this->call(ISeedNeedGroupsTableSeeder::class);
        $this->call(ISeedChecklistQuestionsTableSeeder::class);
        $this->call(ISeedNeedGroupChecklistQuestionTableSeeder::class);

        // Users and Roles
        $this->call(UserSeeder::class);

        // Planning Hierarchy
        $this->call(ISeedPlanningVersionsTableSeeder::class);
        $this->call(ISeedPlanningActivityVersionsTableSeeder::class);
        $this->call(ISeedPlanningActivityIndicatorsTableSeeder::class);
        $this->call(ISeedPlanningActivityYearsTableSeeder::class);

        // Strategic Planning
        $this->call(ISeedRenstrasTableSeeder::class);
        $this->call(ISeedTujuansTableSeeder::class);
        $this->call(ISeedSasaransTableSeeder::class);
        $this->call(ISeedIndicatorsTableSeeder::class);
        $this->call(ISeedIndicatorTargetsTableSeeder::class);

        // KPI
        $this->call(ISeedKpiGroupsTableSeeder::class);
        $this->call(ISeedKpiIndicatorsTableSeeder::class);
        $this->call(ISeedKpiAnnualTargetsTableSeeder::class);

        // Service Plans
        $this->call(ISeedStrategicServicePlansTableSeeder::class);

        // Needs (Core)
        $this->call(ISeedNeedsTableSeeder::class);

        // Needs (Extended)
        $this->call(ISeedNeedDetailsTableSeeder::class);
        $this->call(ISeedNeedAttachmentsTableSeeder::class);
        $this->call(ISeedNeedChecklistAnswersTableSeeder::class);
        $this->call(ISeedNeedIndicatorTableSeeder::class);
        $this->call(ISeedNeedSasaranTableSeeder::class);
        $this->call(ISeedNeedStrategicServicePlanTableSeeder::class);
        $this->call(ISeedKpiIndicatorNeedTableSeeder::class);
    }
}
