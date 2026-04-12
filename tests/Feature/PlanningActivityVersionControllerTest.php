<?php

use App\Models\PlanningActivityVersion;
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
