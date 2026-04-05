<?php

use App\Models\KpiIndicator;
use App\Models\Need;
use App\Models\StrategicServicePlan;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can have multiple kpi indicators', function () {
    $need = Need::factory()->create();
    $indicators = KpiIndicator::factory()->count(3)->create();

    $need->kpiIndicators()->attach($indicators->pluck('id'));

    expect($need->kpiIndicators)->toHaveCount(3);
});

it('can have multiple strategic service plans', function () {
    $need = Need::factory()->create();
    $plans = StrategicServicePlan::factory()->count(2)->create();

    $need->strategicServicePlans()->attach($plans->pluck('id'));

    expect($need->strategicServicePlans)->toHaveCount(2);
});

it('can access needs from kpi indicator', function () {
    $indicator = KpiIndicator::factory()->create();
    $needs = Need::factory()->count(2)->create();

    $indicator->needs()->attach($needs->pluck('id'));

    expect($indicator->needs)->toHaveCount(2);
});

it('can access needs from strategic service plan', function () {
    $plan = StrategicServicePlan::factory()->create();
    $needs = Need::factory()->count(2)->create();

    $plan->needs()->attach($needs->pluck('id'));

    expect($plan->needs)->toHaveCount(2);
});
