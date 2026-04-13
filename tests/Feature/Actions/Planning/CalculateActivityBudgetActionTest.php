<?php

use App\Actions\Planning\CalculateActivityBudgetAction;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use App\Models\PlanningVersion;

it('calculates total budget up the tree correctly', function () {
    $version = PlanningVersion::factory()->create();

    $program = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => null]);
    $kegiatan = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $program->id]);
    $subKegiatan1 = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $kegiatan->id]);
    $subKegiatan2 = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $kegiatan->id]);

    PlanningActivityYear::withoutEvents(function () use ($subKegiatan1, $subKegiatan2) {
        $subKegiatan1->activityYears()->create(['year' => 2025, 'budget' => 1000]);
        $subKegiatan2->activityYears()->create(['year' => 2025, 'budget' => 2000]);
    });

    app(CalculateActivityBudgetAction::class)->execute($subKegiatan1, 2025);

    $kegiatanYear = PlanningActivityYear::where('yearable_id', $kegiatan->id)->where('year', 2025)->first();
    $programYear = PlanningActivityYear::where('yearable_id', $program->id)->where('year', 2025)->first();

    expect($kegiatanYear->total_budget)->toEqual(3000)
        ->and($programYear->total_budget)->toEqual(3000);
});

it('omits calculating if the total is zero entirely', function () {
    $version = PlanningVersion::factory()->create();

    $program = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => null]);
    $kegiatan = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $program->id]);
    
    app(CalculateActivityBudgetAction::class)->execute($kegiatan, 2025);

    $programYear = PlanningActivityYear::where('yearable_id', $program->id)->where('year', 2025)->first();
    // It shouldn't even create the record if nothing necessitates it
    expect($programYear)->toBeNull();
});
