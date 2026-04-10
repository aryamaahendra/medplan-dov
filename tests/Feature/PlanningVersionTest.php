<?php

use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use App\Models\PlanningVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('can list planning versions', function () {
    PlanningVersion::factory()->count(3)->create();

    $response = $this->actingAs($this->user)
        ->get(route('planning-versions.index'));

    $response->assertStatus(200);
});

test('can create planning version empty', function () {
    // 1. Perform store
    $response = $this->actingAs($this->user)
        ->post(route('planning-versions.store'), [
            'name' => 'Original 2026',
            'fiscal_year' => 2026,
            'notes' => 'Test notes',
        ]);

    $response->assertRedirect();

    // 2. Verify version created
    $version = PlanningVersion::where('fiscal_year', 2026)->first();
    expect($version)->not->toBeNull()
        ->and($version->name)->toBe('Original 2026');

    // 3. Verify no activities created automatically
    expect(PlanningActivityVersion::where('planning_version_id', $version->id)->count())->toBe(0);
});

test('can create revision from existing version', function () {
    // 1. Setup version 0 with activities and years
    $v0 = PlanningVersion::factory()->create(['revision_no' => 0]);
    $av0 = PlanningActivityVersion::factory()->create(['planning_version_id' => $v0->id, 'code' => 'ACT1']);
    PlanningActivityYear::factory()->create(['planning_activity_version_id' => $av0->id, 'year' => 2026, 'budget' => 1000]);

    // 2. Perform create revision
    $response = $this->actingAs($this->user)
        ->post(route('planning-versions.create-revision', $v0));

    $response->assertRedirect();

    // 3. Verify version 1 created
    $v1 = PlanningVersion::where('revision_no', 1)->first();
    expect($v1)->not->toBeNull();

    // 4. Verify activities and years cloned
    $av1 = PlanningActivityVersion::where('planning_version_id', $v1->id)->where('code', 'ACT1')->first();
    expect($av1)->not->toBeNull();

    $year1 = PlanningActivityYear::where('planning_activity_version_id', $av1->id)->where('year', 2026)->first();
    expect($year1)->not->toBeNull()
        ->and($year1->budget)->toBe('1000.00');
});

test('can update yearly data', function () {
    $version = PlanningVersion::factory()->create();
    $activityVersion = PlanningActivityVersion::factory()->create(['planning_version_id' => $version->id]);

    $response = $this->actingAs($this->user)
        ->post(route('planning-versions.activities.update-yearly-data', $activityVersion), [
            'year' => 2026,
            'target' => '100%',
            'budget' => 5000000,
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('planning_activity_years', [
        'planning_activity_version_id' => $activityVersion->id,
        'year' => 2026,
        'target' => '100%',
        'budget' => 5000000,
    ]);
});

test('can set current version', function () {
    $v1 = PlanningVersion::factory()->create(['fiscal_year' => 2026, 'is_current' => true]);
    $v2 = PlanningVersion::factory()->create(['fiscal_year' => 2026, 'is_current' => false]);

    $response = $this->actingAs($this->user)
        ->post(route('planning-versions.set-current', $v2));

    $response->assertRedirect();

    expect($v1->fresh()->is_current)->toBeFalse()
        ->and($v2->fresh()->is_current)->toBeTrue();
});
