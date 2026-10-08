<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', fn () => redirect()->route('dashboard.executive'))->name('dashboard');

    // Dashboards
    Route::prefix('dashboard')->name('dashboard.')->controller('App\Http\Controllers\Need\NeedDashboardController')->group(function () {
        Route::get('executive', 'executive')->name('executive');
        Route::get('operations', 'operations')->name('operations');
        Route::get('workspace', 'workspace')->name('workspace');
    });
    // Management
    Route::namespace('App\Http\Controllers\Management')->group(function () {
        Route::resource('users', 'UserController')->except(['create', 'edit', 'show']);
        Route::resource('roles', 'RoleController')->except(['show']);
        Route::resource('permissions', 'PermissionController')->only(['index']);
        Route::resource('organizational-units', 'OrganizationalUnitController')
            ->except(['create', 'edit', 'show']);
    });

    // Need
    Route::namespace('App\Http\Controllers\Need')->group(function () {
        Route::resource('need-types', 'NeedTypeController')->except(['create', 'edit', 'show']);
        Route::resource('need-groups', 'NeedGroupController')->except(['create', 'edit', 'show']);
        Route::post('need-groups/{need_group}/rollover', 'NeedRolloverController@bulkRollover')->name('need-groups.rollover');
        Route::resource('checklist-questions', 'ChecklistQuestionController')->except(['show']);

        Route::controller('NeedGroupChecklistController')
            ->prefix('need-groups/{need_group}/checklists')
            ->name('need-groups.checklists.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/', 'store')->name('store');
                Route::patch('{checklist_question}', 'update')->name('update');
                Route::delete('{checklist_question}', 'destroy')->name('destroy');
                Route::post('reorder', 'reorder')->name('reorder');
            });

        Route::prefix('needs')->name('needs.')->group(function () {
            Route::controller('NeedRolloverController')->group(function () {
                Route::get('unapproved-candidates', 'candidates')->name('unapproved-candidates');
                Route::get('{need}/unapproved-source', 'sourceDetail')->name('unapproved-source');
            });
            Route::controller('NeedController')->group(function () {
                Route::patch('{need}/director-review', 'updateDirectorReview')->name('director-review');
            });
            Route::controller('NeedLockController')->group(function () {
                Route::post('{need}/lock', 'lock')->name('lock');
                Route::post('{need}/unlock', 'unlock')->name('unlock');
            });
            Route::get('export', 'NeedExportController')->name('export');
            Route::get('{need}/export-pdf', 'ExportNeedPdfController')->name('export-pdf');
            Route::controller('NeedChecklistAnswerController')->group(function () {
                Route::post('{need}/checklist-answers', 'store')->name('checklist-answers.store');
            });

            Route::controller('NeedAttachmentController')->group(function () {
                Route::prefix('{need}/attachments')->name('attachments.')->group(function () {
                    Route::get('/', 'index')->name('index');
                    Route::post('/', 'store')->name('store');
                });

                Route::prefix('attachments')->name('attachments.')->group(function () {
                    Route::get('{attachment}', 'download')->name('download');
                    Route::get('{attachment}/view', 'view')->name('view');
                    Route::delete('{attachment}', 'destroy')->name('destroy');
                });
            });
        });

        Route::resource('needs', 'NeedController');
    });

    // Renstra
    Route::namespace('App\Http\Controllers\Renstra')->group(function () {
        Route::resource('renstras', 'RenstraController')->except(['create', 'edit']);
        Route::resource('tujuans', 'TujuanController')->only(['store', 'update', 'destroy']);
        Route::resource('sasarans', 'SasaranController')->only(['store', 'update', 'destroy']);
        Route::resource('indicators', 'IndicatorController')->only(['store', 'update', 'destroy']);
    });

    // Strategic Plan
    Route::namespace('App\Http\Controllers\StrategicPlan')->group(function () {
        Route::resource('strategic-service-plans', 'StrategicServicePlanController')
            ->except(['create', 'edit', 'show']);
    });

    // KPI
    Route::namespace('App\Http\Controllers\Kpi')->prefix('kpis')->name('kpis.')->group(function () {
        Route::resource('groups', 'KpiGroupController');
        Route::controller('KpiGroupController')->group(function () {
            Route::post('groups/{group}/activate', 'activate')->name('groups.activate');
        });
        Route::resource('indicators', 'KpiIndicatorController')
            ->except(['index', 'show', 'create', 'edit']);
    });

    // Planning
    Route::namespace('App\Http\Controllers\Planning')->group(function () {
        Route::resource('planning-versions', 'PlanningVersionController')
            ->except(['create', 'edit', 'show']);

        Route::controller('PlanningVersionController')
            ->prefix('planning-versions/{planning_version}')
            ->name('planning-versions.')
            ->group(function () {
                Route::post('create-revision', 'createRevision')->name('create-revision');
                Route::post('set-current', 'setCurrent')->name('set-current');
            });

        Route::post('planning-versions/{planning_version}/activities/recalculate', 'PlanningRecalculateController')
            ->name('planning-versions.activities.recalculate');

        Route::controller('PlanningActivityVersionController')->group(function () {
            Route::prefix('planning-versions/{planning_version}/activities')
                ->name('planning-versions.activities.')
                ->group(function () {
                    Route::get('/', 'index')->name('index');
                    Route::post('import', 'import')->name('import');
                    Route::get('export', 'export')->name('export');
                    Route::get('create', 'create')->name('create');
                    Route::post('/', 'store')->name('store');
                    Route::get('check-code', 'checkCode')->name('check-code');
                });
            Route::prefix('planning-versions/activities/{planning_activity_version}')
                ->name('planning-versions.activities.')
                ->group(function () {
                    Route::get('edit', 'edit')->name('edit');
                    Route::patch('/', 'update')->name('update');
                    Route::delete('/', 'destroy')->name('destroy');
                    Route::post('year', 'updateYearlyData')
                        ->name('update-yearly-data');
                });
        });
    });
});

require __DIR__.'/settings.php';
