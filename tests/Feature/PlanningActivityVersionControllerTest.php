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
        ->component('planning-activity-versions/index')
        ->has('activities.data', 3)
        ->has('parents')
    );
});

test('it can store a new activity version', function () {
    $version = PlanningVersion::factory()->create();
    $data = [
        'name' => 'New Program Snapshot',
        'type' => 'program',
        'code' => '1.01',
    ];

    $response = $this->post(route('planning-versions.activities.store', $version), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('planning_activity_versions', [
        'planning_version_id' => $version->id,
        'name' => 'New Program Snapshot',
        'type' => 'program',
    ]);
});

test('it can update an activity version', function () {
    $activity = PlanningActivityVersion::factory()->create();
    $data = [
        'name' => 'Updated Activity Name',
        'type' => $activity->type,
    ];

    $response = $this->patch(route('planning-versions.activities.update', $activity), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('planning_activity_versions', [
        'id' => $activity->id,
        'name' => 'Updated Activity Name',
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
        'year' => 2025,
        'target' => '100%',
        'budget' => 150000000.00,
    ];

    $response = $this->post(route('planning-versions.activities.update-yearly-data', $activity), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('planning_activity_years', [
        'planning_activity_version_id' => $activity->id,
        'year' => 2025,
        'target' => '100%',
        'budget' => 150000000.00,
    ]);
});
