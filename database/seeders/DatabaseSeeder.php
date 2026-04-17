<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->call(ISeedUsersTableSeeder::class);

        $admin = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'id' => 2,
                'name' => 'Super Admin',
                'password' => Hash::make('E201admindev$$'),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $admin->assignRole(UserRole::Admin->value);

        $this->call(ISeedJobsTableSeeder::class);
        $this->call(ISeedJobBatchesTableSeeder::class);

        // System / Independent
        $this->call(ISeedChecklistQuestionsTableSeeder::class);
        $this->call(ISeedOrganizationalUnitsTableSeeder::class);
        $this->call(ISeedNeedTypesTableSeeder::class);
        $this->call(ISeedNeedGroupsTableSeeder::class);
        $this->call(ISeedNeedGroupChecklistQuestionTableSeeder::class);

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
