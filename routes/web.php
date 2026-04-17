<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Kpi\KpiGroupController;
use App\Http\Controllers\Kpi\KpiIndicatorController;
use App\Http\Controllers\Management\OrganizationalUnitController;
use App\Http\Controllers\Management\UserController;
use App\Http\Controllers\Need\ChecklistQuestionController;
use App\Http\Controllers\Need\ExportNeedPdfController;
use App\Http\Controllers\Need\NeedAttachmentController;
use App\Http\Controllers\Need\NeedChecklistAnswerController;
use App\Http\Controllers\Need\NeedController;
use App\Http\Controllers\Need\NeedGroupChecklistController;
use App\Http\Controllers\Need\NeedGroupController;
use App\Http\Controllers\Need\NeedTypeController;
use App\Http\Controllers\Planning\PlanningActivityVersionController;
use App\Http\Controllers\Planning\PlanningRecalculateController;
use App\Http\Controllers\Planning\PlanningVersionController;
use App\Http\Controllers\Renstra\IndicatorController;
use App\Http\Controllers\Renstra\RenstraController;
use App\Http\Controllers\Renstra\SasaranController;
use App\Http\Controllers\Renstra\TujuanController;
use App\Http\Controllers\StrategicPlan\StrategicServicePlanController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);
    Route::resource('organizational-units', OrganizationalUnitController::class)->except(['create', 'edit', 'show']);
    Route::resource('need-types', NeedTypeController::class)->except(['create', 'edit', 'show']);
    Route::resource('need-groups', NeedGroupController::class)->except(['create', 'edit', 'show']);
    Route::get('need-groups/{need_group}/checklists', [NeedGroupChecklistController::class, 'index'])->name('need-groups.checklists.index');
    Route::post('need-groups/{need_group}/checklists', [NeedGroupChecklistController::class, 'store'])->name('need-groups.checklists.store');
    Route::patch('need-groups/{need_group}/checklists/{checklist_question}', [NeedGroupChecklistController::class, 'update'])->name('need-groups.checklists.update');
    Route::delete('need-groups/{need_group}/checklists/{checklist_question}', [NeedGroupChecklistController::class, 'destroy'])->name('need-groups.checklists.destroy');
    Route::post('need-groups/{need_group}/checklists/reorder', [NeedGroupChecklistController::class, 'reorder'])->name('need-groups.checklists.reorder');
    Route::patch('needs/{need}/director-review', [NeedController::class, 'updateDirectorReview'])->name('needs.director-review');
    Route::get('needs/{need}/export-pdf', ExportNeedPdfController::class)->name('needs.export-pdf');

    Route::resource('needs', NeedController::class);
    Route::get('needs/{need}/attachments', [NeedAttachmentController::class, 'index'])->name('needs.attachments.index');
    Route::post('needs/{need}/attachments', [NeedAttachmentController::class, 'store'])->name('needs.attachments.store');
    Route::get('needs/attachments/{attachment}', [NeedAttachmentController::class, 'download'])->name('needs.attachments.download');
    Route::get('needs/attachments/{attachment}/view', [NeedAttachmentController::class, 'view'])->name('needs.attachments.view');
    Route::delete('needs/attachments/{attachment}', [NeedAttachmentController::class, 'destroy'])->name('needs.attachments.destroy');
    Route::resource('renstras', RenstraController::class)->except(['create', 'edit']);
    Route::resource('tujuans', TujuanController::class)->except(['index', 'create', 'edit', 'show']);
    Route::resource('sasarans', SasaranController::class)->except(['index', 'create', 'edit', 'show']);
    Route::resource('indicators', IndicatorController::class)->except(['index', 'create', 'edit', 'show']);
    Route::resource('strategic-service-plans', StrategicServicePlanController::class)->except(['create', 'edit', 'show']);
    Route::resource('checklist-questions', ChecklistQuestionController::class)->except(['show']);
    Route::post('needs/{need}/checklist-answers', [NeedChecklistAnswerController::class, 'store'])->name('needs.checklist-answers.store');
    Route::prefix('kpis')->name('kpis.')->group(function () {
        Route::resource('groups', KpiGroupController::class);
        Route::post('groups/{group}/activate', [KpiGroupController::class, 'activate'])->name('groups.activate');
        Route::resource('indicators', KpiIndicatorController::class)->except(['index', 'show', 'create', 'edit']);
    });

    Route::resource('planning-versions', PlanningVersionController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::post('planning-versions/{planning_version}/create-revision', [PlanningVersionController::class, 'createRevision'])->name('planning-versions.create-revision');
    Route::post('planning-versions/{planning_version}/set-current', [PlanningVersionController::class, 'setCurrent'])->name('planning-versions.set-current');

    Route::get('planning-versions/{planning_version}/activities', [PlanningActivityVersionController::class, 'index'])->name('planning-versions.activities.index');
    Route::post('planning-versions/{planning_version}/activities/import', [PlanningActivityVersionController::class, 'import'])->name('planning-versions.activities.import');
    Route::get('planning-versions/{planning_version}/activities/export', [PlanningActivityVersionController::class, 'export'])->name('planning-versions.activities.export');
    Route::get('planning-versions/{planning_version}/activities/create', [PlanningActivityVersionController::class, 'create'])->name('planning-versions.activities.create');
    Route::post('planning-versions/{planning_version}/activities', [PlanningActivityVersionController::class, 'store'])->name('planning-versions.activities.store');
    Route::get('planning-versions/activities/{planning_activity_version}/edit', [PlanningActivityVersionController::class, 'edit'])->name('planning-versions.activities.edit');
    Route::patch('planning-versions/activities/{planning_activity_version}', [PlanningActivityVersionController::class, 'update'])->name('planning-versions.activities.update');
    Route::delete('planning-versions/activities/{planning_activity_version}', [PlanningActivityVersionController::class, 'destroy'])->name('planning-versions.activities.destroy');
    Route::get('planning-versions/{planning_version}/activities/check-code', [PlanningActivityVersionController::class, 'checkCode'])->name('planning-versions.activities.check-code');
    Route::post('planning-versions/activities/{planning_activity_version}/year', [PlanningActivityVersionController::class, 'updateYearlyData'])->name('planning-versions.activities.update-yearly-data');
    Route::post('planning-versions/{planning_version}/activities/recalculate', PlanningRecalculateController::class)->name('planning-versions.activities.recalculate');
});

require __DIR__.'/settings.php';
