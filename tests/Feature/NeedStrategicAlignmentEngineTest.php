<?php

declare(strict_types=1);

use App\Actions\Need\NeedStrategicAlignmentEngine;
use App\DTOs\Need\NeedProposalPayload;
use App\Models\Indicator;
use App\Models\KpiGroup;
use App\Models\KpiIndicator;
use App\Models\Need;
use App\Models\PlanningActivityIndicator;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningVersion;
use App\Models\Renstra;
use App\Models\Sasaran;
use App\Models\StrategicServicePlan;
use App\Models\Tujuan;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('loads active form option trees for strategic alignments', function () {
    // Active Renstra with Tujuan, Sasaran, Indicator
    $activeRenstra = Renstra::factory()->create([
        'is_active' => true,
        'year_start' => 2024,
        'year_end' => 2029,
    ]);
    $tujuan = Tujuan::factory()->create(['renstra_id' => $activeRenstra->id]);
    $sasaran = Sasaran::factory()->create(['tujuan_id' => $tujuan->id]);
    Indicator::factory()->create(['sasaran_id' => $sasaran->id]);

    // Inactive Renstra should be filtered out
    $inactiveRenstra = Renstra::factory()->create(['is_active' => false]);
    Tujuan::factory()->create(['renstra_id' => $inactiveRenstra->id]);

    // Active KPI Group
    $kpiGroup = KpiGroup::factory()->create(['is_active' => true]);
    KpiIndicator::factory()->create(['group_id' => $kpiGroup->id]);

    // Inactive KPI Group
    KpiGroup::factory()->create(['is_active' => false]);

    // Strategic Service Plan
    StrategicServicePlan::factory()->create();

    // Planning Activity Version with current PlanningVersion
    $currentPlanningVersion = PlanningVersion::factory()->create(['is_current' => true]);
    PlanningActivityVersion::factory()->create([
        'planning_version_id' => $currentPlanningVersion->id,
        'parent_id' => null,
    ]);

    // Inactive Planning Version
    $nonCurrentPlanningVersion = PlanningVersion::factory()->create(['is_current' => false]);
    PlanningActivityVersion::factory()->create([
        'planning_version_id' => $nonCurrentPlanningVersion->id,
        'parent_id' => null,
    ]);

    $engine = app(NeedStrategicAlignmentEngine::class);
    $options = $engine->loadFormOptions();

    expect($options)->toHaveKeys(['tujuans', 'kpiGroups', 'strategicServicePlans', 'planningActivities'])
        ->and($options['tujuans']->pluck('id')->all())->toContain($tujuan->id)
        ->and($options['kpiGroups']->pluck('id')->all())->toContain($kpiGroup->id)
        ->and($options['strategicServicePlans'])->toHaveCount(1)
        ->and($options['planningActivities']->pluck('planning_version_id')->all())->each->toBe($currentPlanningVersion->id);
});

it('synchronizes all strategic alignment relationships for a need', function () {
    $need = Need::factory()->create();

    $sasaran = Sasaran::factory()->create();
    $indicator = Indicator::factory()->create();
    $kpiIndicator = KpiIndicator::factory()->create();
    $servicePlan = StrategicServicePlan::factory()->create();
    $activityVersion = PlanningActivityVersion::factory()->create();
    $activityIndicator = PlanningActivityIndicator::query()->create([
        'planning_activity_version_id' => $activityVersion->id,
        'name' => 'Test Indicator',
    ]);

    $payload = new NeedProposalPayload(
        attributes: [],
        sasaranIds: [$sasaran->id],
        indicatorIds: [$indicator->id],
        kpiIndicatorIds: [$kpiIndicator->id],
        strategicServicePlanIds: [$servicePlan->id],
        planningActivityVersionIds: [$activityVersion->id],
        planningActivityIndicatorIds: [$activityIndicator->id],
    );

    $engine = app(NeedStrategicAlignmentEngine::class);
    $engine->syncForNeed($need, $payload);

    expect($need->sasarans()->pluck('sasarans.id')->all())->toBe([$sasaran->id])
        ->and($need->indicators()->pluck('indicators.id')->all())->toBe([$indicator->id])
        ->and($need->kpiIndicators()->pluck('kpi_indicators.id')->all())->toBe([$kpiIndicator->id])
        ->and($need->strategicServicePlans()->pluck('strategic_service_plans.id')->all())->toBe([$servicePlan->id])
        ->and($need->planningActivityVersions()->pluck('planning_activity_versions.id')->all())->toBe([$activityVersion->id])
        ->and($need->planningActivityIndicators()->pluck('planning_activity_indicators.id')->all())->toBe([$activityIndicator->id]);
});

it('supports partial synchronization during updates', function () {
    $need = Need::factory()->create();
    $initialSasaran = Sasaran::factory()->create();
    $initialIndicator = Indicator::factory()->create();
    $need->sasarans()->sync([$initialSasaran->id]);
    $need->indicators()->sync([$initialIndicator->id]);

    $newIndicator = Indicator::factory()->create();

    // In partial update: sasaranIds is null (should be preserved), indicatorIds is given (should be updated)
    $payload = new NeedProposalPayload(
        attributes: [],
        sasaranIds: null,
        indicatorIds: [$newIndicator->id],
    );

    $engine = app(NeedStrategicAlignmentEngine::class);
    $engine->syncForNeed($need, $payload, isPartialUpdate: true);

    expect($need->sasarans()->pluck('sasarans.id')->all())->toBe([$initialSasaran->id])
        ->and($need->indicators()->pluck('indicators.id')->all())->toBe([$newIndicator->id]);
});

it('clones all strategic alignment relationships from source to target need', function () {
    $sourceNeed = Need::factory()->create();
    $targetNeed = Need::factory()->create();

    $sasaran = Sasaran::factory()->create();
    $indicator = Indicator::factory()->create();
    $kpiIndicator = KpiIndicator::factory()->create();
    $servicePlan = StrategicServicePlan::factory()->create();
    $activityVersion = PlanningActivityVersion::factory()->create();
    $activityIndicator = PlanningActivityIndicator::query()->create([
        'planning_activity_version_id' => $activityVersion->id,
        'name' => 'Test Indicator',
    ]);

    $sourceNeed->sasarans()->sync([$sasaran->id]);
    $sourceNeed->indicators()->sync([$indicator->id]);
    $sourceNeed->kpiIndicators()->sync([$kpiIndicator->id]);
    $sourceNeed->strategicServicePlans()->sync([$servicePlan->id]);
    $sourceNeed->planningActivityVersions()->sync([$activityVersion->id]);
    $sourceNeed->planningActivityIndicators()->sync([$activityIndicator->id]);

    $engine = app(NeedStrategicAlignmentEngine::class);
    $engine->cloneAlignments($sourceNeed, $targetNeed);

    expect($targetNeed->sasarans()->pluck('sasarans.id')->all())->toBe([$sasaran->id])
        ->and($targetNeed->indicators()->pluck('indicators.id')->all())->toBe([$indicator->id])
        ->and($targetNeed->kpiIndicators()->pluck('kpi_indicators.id')->all())->toBe([$kpiIndicator->id])
        ->and($targetNeed->strategicServicePlans()->pluck('strategic_service_plans.id')->all())->toBe([$servicePlan->id])
        ->and($targetNeed->planningActivityVersions()->pluck('planning_activity_versions.id')->all())->toBe([$activityVersion->id])
        ->and($targetNeed->planningActivityIndicators()->pluck('planning_activity_indicators.id')->all())->toBe([$activityIndicator->id]);
});

it('verifies strategic alignment completeness', function () {
    $need = Need::factory()->create();
    $engine = app(NeedStrategicAlignmentEngine::class);

    expect($engine->verifyCompleteness($need))->toBeFalse();

    $sasaran = Sasaran::factory()->create();
    $indicator = Indicator::factory()->create();
    $kpiIndicator = KpiIndicator::factory()->create();
    $servicePlan = StrategicServicePlan::factory()->create();

    $need->sasarans()->sync([$sasaran->id]);
    $need->indicators()->sync([$indicator->id]);
    $need->kpiIndicators()->sync([$kpiIndicator->id]);
    expect($engine->verifyCompleteness($need))->toBeFalse();

    $need->strategicServicePlans()->sync([$servicePlan->id]);
    expect($engine->verifyCompleteness($need))->toBeTrue();
});
