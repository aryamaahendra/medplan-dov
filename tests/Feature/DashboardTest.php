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
    $group = NeedGroup::factory()->create(['year' => 2024, 'is_active' => true]);
    Need::factory()->count(3)->create(['need_group_id' => $group->id, 'total_price' => 1000]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('stats', fn (Assert $stats) => $stats
            ->where('total_needs', 3)
            ->where('total_budget', '3000.00')
            ->etc()
        )
        ->has('needGroups')
        ->where('filters.need_group_id', $group->id)
    );
});

test('dashboard can be filtered by need group', function () {
    $user = User::factory()->create();
    $group1 = NeedGroup::factory()->create(['year' => 2024]);
    $group2 = NeedGroup::factory()->create(['year' => 2025]);

    Need::factory()->create(['need_group_id' => $group1->id]);
    Need::factory()->count(2)->create(['need_group_id' => $group2->id]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard', ['need_group_id' => $group2->id]));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('stats.total_needs', 2)
        ->where('filters.need_group_id', $group2->id)
    );
});
