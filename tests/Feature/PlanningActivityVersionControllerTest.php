<?php

use App\Models\PlanningActivityIndicator;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use App\Models\PlanningVersion;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('it can display activities for a version', function () {
    $version = PlanningVersion::factory()->create();
    PlanningActivityVersion::factory(3)->create(['planning_version_id' => $version->id]);

    $response = $this->get(route('planning-versions.activities.index', $version));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('planning/activity-versions/index')
        ->has('activities.data', 3)
    );
});

test('it can store a new activity version with indicators', function () {
    $version = PlanningVersion::factory()->create();
    $data = [
        'name' => 'New Program Snapshot',
        'code' => '1.01',
        'type' => 'PROGRAM',
        'indicators' => [
            [
                'name' => 'Indicator 1',
                'baseline' => '100',
                'unit' => '%',
            ],
            [
                'name' => 'Indicator 2',
                'baseline' => '200',
                'unit' => 'kg',
            ],
        ],
    ];

    $response = $this->post(route('planning-versions.activities.store', $version), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('planning_activity_versions', [
        'planning_version_id' => $version->id,
        'name' => 'New Program Snapshot',
        'type' => 'PROGRAM',
    ]);

    $this->assertDatabaseHas('planning_activity_indicators', [
        'name' => 'Indicator 1',
        'baseline' => '100',
        'unit' => '%',
    ]);

    $this->assertDatabaseHas('planning_activity_indicators', [
        'name' => 'Indicator 2',
        'baseline' => '200',
        'unit' => 'kg',
    ]);
});

test('it can update an activity version and sync indicators', function () {
    $activity = PlanningActivityVersion::factory()->create();
    $indicatorToKeep = $activity->indicators()->create(['name' => 'Keep Me', 'baseline' => '1', 'unit' => 'pt']);
    $indicatorToDrop = $activity->indicators()->create(['name' => 'Drop Me', 'baseline' => '2', 'unit' => 'pt']);

    $data = [
        'name' => 'Updated Activity Name',
        'type' => 'KEGIATAN',
        'indicators' => [
            [
                'id' => $indicatorToKeep->id,
                'name' => 'Kept & Renamed',
                'baseline' => '1',
                'unit' => 'pt',
            ],
            [
                'name' => 'New Included',
                'baseline' => '3',
                'unit' => 'pt',
            ],
        ],
    ];

    $response = $this->patch(route('planning-versions.activities.update', $activity), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('planning_activity_versions', [
        'id' => $activity->id,
        'name' => 'Updated Activity Name',
        'type' => 'KEGIATAN',
    ]);

    $this->assertDatabaseHas('planning_activity_indicators', [
        'id' => $indicatorToKeep->id,
        'name' => 'Kept & Renamed',
    ]);

    $this->assertDatabaseHas('planning_activity_indicators', [
        'name' => 'New Included',
    ]);

    $this->assertDatabaseMissing('planning_activity_indicators', [
        'id' => $indicatorToDrop->id,
    ]);
});

test('it can delete an activity version', function () {
    $activity = PlanningActivityVersion::factory()->create();

    $response = $this->delete(route('planning-versions.activities.destroy', $activity));

    $response->assertRedirect();
    $this->assertDatabaseMissing('planning_activity_versions', ['id' => $activity->id]);
});

test('it can update yearly data for an activity version', function () {
    $activity = PlanningActivityVersion::factory()->create();
    $data = [
        'yearable_id' => $activity->id,
        'yearable_type' => 'activity',
        'year' => 2025,
        'target' => '100%',
        'budget' => 150000000.00,
    ];

    $response = $this->post(route('planning-versions.activities.update-yearly-data', $activity), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('planning_activity_years', [
        'yearable_id' => $activity->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2025,
        'target' => '100%',
        'budget' => 150000000.00,
    ]);
});

test('index response includes parent activity_years for child activities', function () {
    $version = PlanningVersion::factory()->create();

    $parent = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $version->id,
        'code' => '1',
        'sort_order' => 1,
    ]);

    PlanningActivityYear::create([
        'yearable_id' => $parent->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2025,
        'budget' => 500000000,
    ]);

    PlanningActivityVersion::factory()->create([
        'planning_version_id' => $version->id,
        'parent_id' => $parent->id,
        'code' => '1.01',
        'sort_order' => 2,
    ]);

    $response = $this->get(route('planning-versions.activities.index', $version));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('planning/activity-versions/index')
        ->has('activities.data', 2)
        // child (index 1 after sort_order) should carry parent.activity_years
        ->has('activities.data.1.parent.activity_years')
        ->where('activities.data.1.parent.code', '1')
    );
});

test('it can update yearly data to null when budget is 0 or target is -', function () {
    $activity = PlanningActivityVersion::factory()->create();

    // 1. Test budget 0 -> null
    $data = [
        'yearable_id' => $activity->id,
        'yearable_type' => 'activity',
        'year' => 2025,
        'target' => '100%',
        'budget' => 0,
    ];

    // The frontend handles the 0->null conversion before sending,
    // but the controller itself just takes the nullable value.
    // Let's simulate the frontend sending null for 0.
    $response = $this->post(route('planning-versions.activities.update-yearly-data', $activity), [
        ...$data,
        'budget' => null,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('planning_activity_years', [
        'yearable_id' => $activity->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2025,
        'budget' => null,
    ]);

    // 2. Test target - -> null (simulated as frontend sending null)
    $indicator = $activity->indicators()->create(['name' => 'Ind 1']);
    $response = $this->post(route('planning-versions.activities.update-yearly-data', $activity), [
        'yearable_id' => $indicator->id,
        'yearable_type' => 'indicator',
        'year' => 2025,
        'target' => null,
        'budget' => 0,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('planning_activity_years', [
        'yearable_id' => $indicator->id,
        'yearable_type' => PlanningActivityIndicator::class,
        'year' => 2025,
        'target' => null,
    ]);
});
