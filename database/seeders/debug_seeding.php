<?php

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

function report($msg)
{
    echo "[$msg] User count: ".DB::table('users')->count()."\n";
}

report('Start');

Artisan::call('db:seed', ['--class' => 'Database\Seeders\RolesAndPermissionsSeeder', '--force' => true]);
report('After RolesAndPermissionsSeeder');

Artisan::call('db:seed', ['--class' => 'Database\Seeders\ISeedUsersTableSeeder', '--force' => true]);
report('After ISeedUsersTableSeeder');

foreach (UserRole::cases() as $role) {
    $user = User::updateOrCreate(
        ['email' => $role->value.'@admin.com'],
        ['name' => $role->label(), 'password' => 'password']
    );
    $user->assignRole($role->value);
}
report('After Loop');

$seeders = [
    'ISeedChecklistQuestionsTableSeeder',
    'ISeedOrganizationalUnitsTableSeeder',
    'ISeedNeedTypesTableSeeder',
    'ISeedNeedGroupsTableSeeder',
    'ISeedNeedGroupChecklistQuestionTableSeeder',
    'ISeedPlanningVersionsTableSeeder',
    'ISeedPlanningActivityVersionsTableSeeder',
    'ISeedPlanningActivityIndicatorsTableSeeder',
    'ISeedPlanningActivityYearsTableSeeder',
    'ISeedRenstrasTableSeeder',
    'ISeedTujuansTableSeeder',
    'ISeedSasaransTableSeeder',
    'ISeedIndicatorsTableSeeder',
    'ISeedIndicatorTargetsTableSeeder',
    'ISeedKpiGroupsTableSeeder',
    'ISeedKpiIndicatorsTableSeeder',
    'ISeedKpiAnnualTargetsTableSeeder',
    'ISeedStrategicServicePlansTableSeeder',
    'ISeedNeedsTableSeeder',
    'ISeedNeedDetailsTableSeeder',
    'ISeedNeedAttachmentsTableSeeder',
    'ISeedNeedChecklistAnswersTableSeeder',
    'ISeedNeedIndicatorTableSeeder',
    'ISeedNeedSasaranTableSeeder',
    'ISeedNeedStrategicServicePlanTableSeeder',
    'ISeedKpiIndicatorNeedTableSeeder',
];

foreach ($seeders as $seeder) {
    try {
        Artisan::call('db:seed', ['--class' => "Database\\Seeders\\$seeder", '--force' => true]);
        report("After $seeder");
        if (DB::table('users')->count() === 0) {
            echo "!!!! $seeder WIPED THE USERS !!!!\n";
            break;
        }
    } catch (Exception $e) {
        echo "Error seeding $seeder: ".$e->getMessage()."\n";
    }
}
