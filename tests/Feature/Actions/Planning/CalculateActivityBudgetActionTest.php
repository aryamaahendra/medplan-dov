<?php

use App\Actions\Planning\CalculateActivityBudgetAction;
use App\Enums\PlanningActivityType;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use App\Models\PlanningVersion;

/**
 * Helper: create a typed activity hierarchy for testing.
 *
 * Returns:
 * [
 *   'program'     => PlanningActivityVersion (PROGRAM),
 *   'outcome'     => PlanningActivityVersion (OUTCOME, parent=program),
 *   'kegiatan'    => PlanningActivityVersion (KEGIATAN, parent=program),
 *   'keg_output'  => PlanningActivityVersion (OUTPUT, parent=kegiatan),
 *   'subkegiatan' => PlanningActivityVersion (SUBKEGIATAN, parent=kegiatan),
 *   'sub_output1' => PlanningActivityVersion (OUTPUT, parent=subkegiatan),
 *   'sub_output2' => PlanningActivityVersion (OUTPUT, parent=subkegiatan),
 * ]
 *
 * @return array<string, PlanningActivityVersion>
 */
function createHierarchy(?PlanningVersion $version = null): array
{
    $version ??= PlanningVersion::factory()->create(['year_start' => 2025]);
    $vId = $version->id;

    $program = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => null, 'type' => PlanningActivityType::Program,
    ]);

    $outcome = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => $program->id, 'type' => PlanningActivityType::Outcome,
    ]);

    $kegiatan = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => $program->id, 'type' => PlanningActivityType::Kegiatan,
    ]);

    $kegOutput = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => $kegiatan->id, 'type' => PlanningActivityType::Output,
    ]);

    $subkegiatan = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => $kegiatan->id, 'type' => PlanningActivityType::Subkegiatan,
    ]);

    $subOutput1 = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => $subkegiatan->id, 'type' => PlanningActivityType::Output,
    ]);

    $subOutput2 = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => $subkegiatan->id, 'type' => PlanningActivityType::Output,
    ]);

    return compact('program', 'outcome', 'kegiatan', 'kegOutput', 'subkegiatan', 'subOutput1', 'subOutput2');
}

/**
 * Helper: get a year record's field value for an activity.
 */
function yearValue(PlanningActivityVersion $activity, int $year, string $field): mixed
{
    return PlanningActivityYear::where('yearable_id', $activity->id)
        ->where('yearable_type', PlanningActivityVersion::class)
        ->where('year', $year)
        ->value($field);
}

// ──────────────────────────────────────────────────────────────────────
// Manual Budget Rollup Tests
// ──────────────────────────────────────────────────────────────────────

it('rolls up subkegiatan manual budget to kegiatan and program', function () {
    $h = createHierarchy();

    // Set budgets on two subkegiatans (reuse the one from hierarchy + create another)
    $version = PlanningVersion::first();
    $sub2 = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $version->id,
        'parent_id' => $h['kegiatan']->id,
        'type' => PlanningActivityType::Subkegiatan,
    ]);

    PlanningActivityYear::withoutEvents(fn () => $h['subkegiatan']->activityYears()->create(['year' => 2025, 'budget' => 1000]));
    PlanningActivityYear::withoutEvents(fn () => $sub2->activityYears()->create(['year' => 2025, 'budget' => 2000]));

    // Trigger rollup from subkegiatan
    $action = app(CalculateActivityBudgetAction::class);
    $action->execute($h['subkegiatan'], 2025);

    expect(yearValue($h['kegiatan'], 2025, 'budget'))->toEqual(3000)
        ->and(yearValue($h['program'], 2025, 'budget'))->toEqual(3000);
});

it('rolls up kegiatan manual budget override to program only', function () {
    $h = createHierarchy();

    // Set subkegiatan budget and roll up first
    PlanningActivityYear::withoutEvents(fn () => $h['subkegiatan']->activityYears()->create(['year' => 2025, 'budget' => 1000]));
    app(CalculateActivityBudgetAction::class)->execute($h['subkegiatan'], 2025);

    // Verify initial state
    expect(yearValue($h['kegiatan'], 2025, 'budget'))->toEqual(1000)
        ->and(yearValue($h['program'], 2025, 'budget'))->toEqual(1000);

    // Manually override kegiatan budget to 5000
    PlanningActivityYear::withoutEvents(function () use ($h) {
        PlanningActivityYear::where('yearable_id', $h['kegiatan']->id)
            ->where('year', 2025)
            ->update(['budget' => 5000]);
    });

    // Trigger rollup from kegiatan (simulating a manual edit)
    app(CalculateActivityBudgetAction::class)->execute($h['kegiatan'], 2025);

    // Program should now reflect the kegiatan override
    expect(yearValue($h['program'], 2025, 'budget'))->toEqual(5000)
        // Kegiatan budget stays as the manual override
        ->and(yearValue($h['kegiatan'], 2025, 'budget'))->toEqual(5000);
});

// ──────────────────────────────────────────────────────────────────────
// No-op Tests (Outcome & Kegiatan Output)
// ──────────────────────────────────────────────────────────────────────

it('does nothing when outcome is updated', function () {
    $h = createHierarchy();

    PlanningActivityYear::withoutEvents(fn () => $h['outcome']->activityYears()->create(['year' => 2025, 'budget' => 9999]));

    app(CalculateActivityBudgetAction::class)->execute($h['outcome'], 2025);

    // Program should have NO year record created
    expect(yearValue($h['program'], 2025, 'budget'))->toBeNull()
        ->and(yearValue($h['program'], 2025, 'total_budget'))->toBeNull();
});

it('does nothing when kegiatan output is updated', function () {
    $h = createHierarchy();

    PlanningActivityYear::withoutEvents(fn () => $h['kegOutput']->activityYears()->create(['year' => 2025, 'budget' => 9999]));

    app(CalculateActivityBudgetAction::class)->execute($h['kegOutput'], 2025);

    // Kegiatan should have NO year record created from this
    expect(yearValue($h['kegiatan'], 2025, 'budget'))->toBeNull()
        ->and(yearValue($h['kegiatan'], 2025, 'total_budget'))->toBeNull();
});

// ──────────────────────────────────────────────────────────────────────
// Computed Budget Rollup Tests
// ──────────────────────────────────────────────────────────────────────

it('rolls up subkegiatan output to computed budget chain', function () {
    $h = createHierarchy();

    PlanningActivityYear::withoutEvents(fn () => $h['subOutput1']->activityYears()->create(['year' => 2025, 'budget' => 500]));
    PlanningActivityYear::withoutEvents(fn () => $h['subOutput2']->activityYears()->create(['year' => 2025, 'budget' => 700]));

    app(CalculateActivityBudgetAction::class)->execute($h['subOutput1'], 2025);

    expect(yearValue($h['subkegiatan'], 2025, 'total_budget'))->toEqual(1200)
        ->and(yearValue($h['kegiatan'], 2025, 'total_budget'))->toEqual(1200)
        ->and(yearValue($h['program'], 2025, 'total_budget'))->toEqual(1200);
});

it('keeps manual and computed budget lanes independent', function () {
    $h = createHierarchy();

    // 1. Set subkegiatan manual budget
    PlanningActivityYear::withoutEvents(fn () => $h['subkegiatan']->activityYears()->create(['year' => 2025, 'budget' => 3000]));
    app(CalculateActivityBudgetAction::class)->execute($h['subkegiatan'], 2025);

    // 2. Set subkegiatan outputs (computed source)
    PlanningActivityYear::withoutEvents(fn () => $h['subOutput1']->activityYears()->create(['year' => 2025, 'budget' => 500]));
    PlanningActivityYear::withoutEvents(fn () => $h['subOutput2']->activityYears()->create(['year' => 2025, 'budget' => 700]));
    app(CalculateActivityBudgetAction::class)->execute($h['subOutput1'], 2025);

    // Manual lane: kegiatan.budget = 3000, program.budget = 3000
    expect(yearValue($h['kegiatan'], 2025, 'budget'))->toEqual(3000)
        ->and(yearValue($h['program'], 2025, 'budget'))->toEqual(3000);

    // Computed lane: subkegiatan.total_budget = 1200, kegiatan.total_budget = 1200, program.total_budget = 1200
    expect(yearValue($h['subkegiatan'], 2025, 'total_budget'))->toEqual(1200)
        ->and(yearValue($h['kegiatan'], 2025, 'total_budget'))->toEqual(1200)
        ->and(yearValue($h['program'], 2025, 'total_budget'))->toEqual(1200);
});

// ──────────────────────────────────────────────────────────────────────
// Edge Cases
// ──────────────────────────────────────────────────────────────────────

it('sets budget to null when all children have zero budget', function () {
    $h = createHierarchy();

    app(CalculateActivityBudgetAction::class)->execute($h['subkegiatan'], 2025);

    // No year records should be created when there's nothing to sum
    expect(yearValue($h['kegiatan'], 2025, 'budget'))->toBeNull();
});

it('recalculates both old and new parent chains when activity moves', function () {
    $version = PlanningVersion::factory()->create(['year_start' => 2025]);
    $vId = $version->id;

    $program1 = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => null, 'type' => PlanningActivityType::Program,
    ]);
    $program2 = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => null, 'type' => PlanningActivityType::Program,
    ]);
    $kegiatan = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => $program1->id, 'type' => PlanningActivityType::Kegiatan,
    ]);
    $subkegiatan = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $vId, 'parent_id' => $kegiatan->id, 'type' => PlanningActivityType::Subkegiatan,
    ]);

    // Set budget on subkegiatan and roll up manually
    PlanningActivityYear::withoutEvents(fn () => $subkegiatan->activityYears()->create(['year' => 2025, 'budget' => 5000]));
    app(CalculateActivityBudgetAction::class)->execute($subkegiatan, 2025);

    // Verify initial state
    expect(yearValue($kegiatan, 2025, 'budget'))->toEqual(5000)
        ->and(yearValue($program1, 2025, 'budget'))->toEqual(5000);

    // Move kegiatan to program2 (observer triggers recalc for old and new parent)
    $kegiatan->update(['parent_id' => $program2->id]);

    // Old parent should be zeroed out, new parent should have the budget
    expect(yearValue($program1, 2025, 'budget'))->toBeNull()
        ->and(yearValue($program2, 2025, 'budget'))->toEqual(5000);
});
