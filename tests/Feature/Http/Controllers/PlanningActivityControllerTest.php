<?php

use App\Models\PlanningVersion;
use App\Models\User;

test('authenticated user can view activities of a planning version', function () {
    $user = User::factory()->create();
    $user->assignRole('super-admin');
    $version = PlanningVersion::factory()->create();

    $response = $this->actingAs($user)->get(route('planning-versions.activities.index', $version));

    $response->assertOk();
});
