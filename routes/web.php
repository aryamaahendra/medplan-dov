<?php

use App\Http\Controllers\IndicatorController;
use App\Http\Controllers\KpiGroupController;
use App\Http\Controllers\KpiIndicatorController;
use App\Http\Controllers\NeedController;
use App\Http\Controllers\NeedTypeController;
use App\Http\Controllers\OrganizationalUnitController;
use App\Http\Controllers\RenstraController;
use App\Http\Controllers\SasaranController;
use App\Http\Controllers\TujuanController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('users', UserController::class)->except(['create', 'edit']);
    Route::resource('organizational-units', OrganizationalUnitController::class)->except(['create', 'edit', 'show']);
    Route::resource('need-types', NeedTypeController::class)->except(['create', 'edit', 'show']);
    Route::resource('needs', NeedController::class)->except(['show']);
    Route::resource('renstras', RenstraController::class)->except(['create', 'edit']);
    Route::resource('tujuans', TujuanController::class)->except(['index', 'create', 'edit', 'show']);
    Route::resource('sasarans', SasaranController::class)->except(['index', 'create', 'edit', 'show']);
    Route::resource('indicators', IndicatorController::class)->except(['index', 'create', 'edit', 'show']);

    Route::prefix('kpis')->name('kpis.')->group(function () {
        Route::resource('groups', KpiGroupController::class);
        Route::post('groups/{group}/activate', [KpiGroupController::class, 'activate'])->name('groups.activate');
        Route::resource('indicators', KpiIndicatorController::class)->except(['index', 'show', 'create', 'edit']);
    });
});

require __DIR__.'/settings.php';
