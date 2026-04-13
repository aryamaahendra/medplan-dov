<?php

use App\Actions\Planning\CalculateActivityBudgetAction;
use App\Enums\PlanningActivityType;
use App\Jobs\CalculateActivityBudgetJob;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use App\Models\PlanningVersion;
use Illuminate\Support\Facades\Queue;

it('clears derivative budgets before recalculating', function () {
    $version = PlanningVersion::factory()->create(['year_start' => 2025]);

    // Create a hierarchy
    $program = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'type' => PlanningActivityType::Program]);
    $kegiatan = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $program->id, 'type' => PlanningActivityType::Kegiatan]);
    $subkegiatan = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $kegiatan->id, 'type' => PlanningActivityType::Subkegiatan]);

    // Set some derivative values manually (to verify they get cleared)
    PlanningActivityYear::factory()->create([
        'yearable_id' => $program->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2025,
        'budget' => 5000,
        'total_budget' => 5000,
    ]);

    PlanningActivityYear::factory()->create([
        'yearable_id' => $kegiatan->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2025,
        'budget' => 3000,
        'total_budget' => 3000,
    ]);

    PlanningActivityYear::factory()->create([
        'yearable_id' => $subkegiatan->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2025,
        'budget' => 1000,
        'total_budget' => 1000,
    ]);

    Queue::fake();

    app(CalculateActivityBudgetAction::class)->recalculateVersion($version);

    // Assert derivative budgets are null
    expect(PlanningActivityYear::where('yearable_id', $program->id)->first()->budget)->toBeNull()
        ->and(PlanningActivityYear::where('yearable_id', $program->id)->first()->total_budget)->toBeNull()
        ->and(PlanningActivityYear::where('yearable_id', $kegiatan->id)->first()->budget)->toBeNull()
        ->and(PlanningActivityYear::where('yearable_id', $kegiatan->id)->first()->total_budget)->toBeNull();

    // Assert Subkegiatan manual budget is PRESERVED, but total_budget is cleared
    expect(PlanningActivityYear::where('yearable_id', $subkegiatan->id)->first()->budget)->toEqual(1000)
        ->and(PlanningActivityYear::where('yearable_id', $subkegiatan->id)->first()->total_budget)->toBeNull();
});

it('dispatches jobs for all source activities across all years', function () {
    $version = PlanningVersion::factory()->create(['year_start' => 2025, 'year_end' => 2026]);

    // Manual sources: Subkegiatan, Kegiatan
    $sub = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'type' => PlanningActivityType::Subkegiatan]);
    $keg = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'type' => PlanningActivityType::Kegiatan]);

    // Computed source: Output under Subkegiatan
    $out = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $sub->id, 'type' => PlanningActivityType::Output]);

    Queue::fake();

    app(CalculateActivityBudgetAction::class)->recalculateVersion($version);

    // Verify jobs dispatched for all 3 sources and 2 years = 6 jobs
    Queue::assertPushed(CalculateActivityBudgetJob::class, 6);

    Queue::assertPushed(CalculateActivityBudgetJob::class, fn ($job) => $job->activity->id === $sub->id && $job->year === 2025);
    Queue::assertPushed(CalculateActivityBudgetJob::class, fn ($job) => $job->activity->id === $sub->id && $job->year === 2026);
    Queue::assertPushed(CalculateActivityBudgetJob::class, fn ($job) => $job->activity->id === $keg->id && $job->year === 2025);
    Queue::assertPushed(CalculateActivityBudgetJob::class, fn ($job) => $job->activity->id === $keg->id && $job->year === 2026);
    Queue::assertPushed(CalculateActivityBudgetJob::class, fn ($job) => $job->activity->id === $out->id && $job->year === 2025);
    Queue::assertPushed(CalculateActivityBudgetJob::class, fn ($job) => $job->activity->id === $out->id && $job->year === 2026);
});

it('performs a full tree synchronization correctly', function () {
    $version = PlanningVersion::factory()->create(['year_start' => 2025, 'year_end' => 2025]);

    $program = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => null, 'type' => PlanningActivityType::Program]);
    $kegiatan = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $program->id, 'type' => PlanningActivityType::Kegiatan]);
    $sub1 = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $kegiatan->id, 'type' => PlanningActivityType::Subkegiatan]);
    $sub2 = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $kegiatan->id, 'type' => PlanningActivityType::Subkegiatan]);

    // Outputs for sub1
    $out1 = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $sub1->id, 'type' => PlanningActivityType::Output]);
    $out2 = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id, 'parent_id' => $sub1->id, 'type' => PlanningActivityType::Output]);

    // Set leaf values
    // Manual lane
    PlanningActivityYear::withoutEvents(fn () => $sub1->activityYears()->create(['year' => 2025, 'budget' => 1000]));
    PlanningActivityYear::withoutEvents(fn () => $sub2->activityYears()->create(['year' => 2025, 'budget' => 2000]));

    // Computed lane (for sub1)
    PlanningActivityYear::withoutEvents(fn () => $out1->activityYears()->create(['year' => 2025, 'budget' => 400]));
    PlanningActivityYear::withoutEvents(fn () => $out2->activityYears()->create(['year' => 2025, 'budget' => 300]));

    // Run sync (sync jobs for this test by not faking queue)
    app(CalculateActivityBudgetAction::class)->recalculateVersion($version);

    // Verify Manual chain
    // Kegiatan = 1000 + 2000 = 3000
    // Program = 3000
    expect(PlanningActivityYear::where('yearable_id', $kegiatan->id)->value('budget'))->toEqual('3000.00')
        ->and(PlanningActivityYear::where('yearable_id', $program->id)->value('budget'))->toEqual('3000.00');

    // Verify Computed chain
    // Sub1 total = 400 + 300 = 700
    // Sub2 total = 2000 (from budget)
    // Kegiatan total = 700 + 2000 = 2700
    // Program total = 2700
    expect(PlanningActivityYear::where('yearable_id', $sub1->id)->value('total_budget'))->toEqual('700.00')
        ->and(PlanningActivityYear::where('yearable_id', $kegiatan->id)->value('total_budget'))->toEqual('2700.00')
        ->and(PlanningActivityYear::where('yearable_id', $program->id)->value('total_budget'))->toEqual('2700.00');
});
