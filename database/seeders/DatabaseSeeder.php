<?php

namespace Database\Seeders;

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
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('E201admindev$$'),
        ]);

        $this->call(ISeedCacheTableSeeder::class);
        $this->call(ISeedCacheLocksTableSeeder::class);
        $this->call(ISeedChecklistQuestionsTableSeeder::class);
        $this->call(ISeedFailedJobsTableSeeder::class);
        $this->call(ISeedIndicatorTargetsTableSeeder::class);
        $this->call(ISeedIndicatorsTableSeeder::class);
        $this->call(ISeedJobBatchesTableSeeder::class);
        $this->call(ISeedJobsTableSeeder::class);
        $this->call(ISeedKpiAnnualTargetsTableSeeder::class);
        $this->call(ISeedKpiGroupsTableSeeder::class);
        $this->call(ISeedKpiIndicatorNeedTableSeeder::class);
        $this->call(ISeedKpiIndicatorsTableSeeder::class);
        $this->call(ISeedMigrationsTableSeeder::class);
        $this->call(ISeedNeedAttachmentsTableSeeder::class);
        $this->call(ISeedNeedChecklistAnswersTableSeeder::class);
        $this->call(ISeedNeedDetailsTableSeeder::class);
        $this->call(ISeedNeedGroupChecklistQuestionTableSeeder::class);
        $this->call(ISeedNeedGroupsTableSeeder::class);
        $this->call(ISeedNeedIndicatorTableSeeder::class);
        $this->call(ISeedNeedSasaranTableSeeder::class);
        $this->call(ISeedNeedStrategicServicePlanTableSeeder::class);
        $this->call(ISeedNeedTypesTableSeeder::class);
        $this->call(ISeedNeedsTableSeeder::class);
        $this->call(ISeedOrganizationalUnitsTableSeeder::class);
        $this->call(ISeedPasswordResetTokensTableSeeder::class);
        $this->call(ISeedPlanningActivityIndicatorsTableSeeder::class);
        $this->call(ISeedPlanningActivityVersionsTableSeeder::class);
        $this->call(ISeedPlanningActivityYearsTableSeeder::class);
        $this->call(ISeedPlanningVersionsTableSeeder::class);
        $this->call(ISeedRenstrasTableSeeder::class);
        $this->call(ISeedSasaransTableSeeder::class);
        $this->call(ISeedSessionsTableSeeder::class);
        $this->call(ISeedStrategicServicePlansTableSeeder::class);
        $this->call(ISeedTujuansTableSeeder::class);
        $this->call(ISeedUsersTableSeeder::class);
    }
}
