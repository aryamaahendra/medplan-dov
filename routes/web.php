<?php

use App\Http\Controllers\IndicatorController;
use App\Http\Controllers\NeedController;
use App\Http\Controllers\NeedTypeController;
use App\Http\Controllers\OrganizationalUnitController;
use App\Http\Controllers\RenstraController;
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
    Route::resource('needs', NeedController::class)->except(['create', 'edit', 'show']);
    Route::resource('renstras', RenstraController::class)->except(['create', 'edit']);
    Route::resource('tujuans', TujuanController::class)->except(['index', 'create', 'edit', 'show']);
    Route::resource('indicators', IndicatorController::class)->except(['index', 'create', 'edit', 'show']);
});

require __DIR__.'/settings.php';
