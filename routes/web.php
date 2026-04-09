<?php

use App\Http\Controllers\ChecklistQuestionController;
use App\Http\Controllers\IndicatorController;
use App\Http\Controllers\KpiGroupController;
use App\Http\Controllers\KpiIndicatorController;
use App\Http\Controllers\NeedChecklistAnswerController;
use App\Http\Controllers\NeedController;
use App\Http\Controllers\NeedGroupChecklistController;
use App\Http\Controllers\NeedGroupController;
use App\Http\Controllers\NeedTypeController;
use App\Http\Controllers\OrganizationalUnitController;
use App\Http\Controllers\RenstraController;
use App\Http\Controllers\SasaranController;
use App\Http\Controllers\StrategicServicePlanController;
use App\Http\Controllers\TujuanController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);
    Route::resource('organizational-units', OrganizationalUnitController::class)->except(['create', 'edit', 'show']);
    Route::resource('need-types', NeedTypeController::class)->except(['create', 'edit', 'show']);
    Route::resource('need-groups', NeedGroupController::class)->except(['create', 'edit', 'show']);
    Route::get('need-groups/{need_group}/checklists', [NeedGroupChecklistController::class, 'index'])->name('need-groups.checklists.index');
    Route::post('need-groups/{need_group}/checklists', [NeedGroupChecklistController::class, 'store'])->name('need-groups.checklists.store');
    Route::patch('need-groups/{need_group}/checklists/{checklist_question}', [NeedGroupChecklistController::class, 'update'])->name('need-groups.checklists.update');
    Route::delete('need-groups/{need_group}/checklists/{checklist_question}', [NeedGroupChecklistController::class, 'destroy'])->name('need-groups.checklists.destroy');
    Route::post('need-groups/{need_group}/checklists/reorder', [NeedGroupChecklistController::class, 'reorder'])->name('need-groups.checklists.reorder');
    Route::resource('needs', NeedController::class);
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
});

require __DIR__.'/settings.php';
