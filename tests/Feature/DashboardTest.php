<?php

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard and see stats', function () {
    $user = User::factory()->create();
    $user->assignRole('super-admin');
    $group = NeedGroup::factory()->create(['year' => 2024, 'is_active' => true]);
    Need::factory()->count(3)->create(['need_group_id' => $group->id, 'total_price' => 1000]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('dashboardData')
    );
});
