<?php

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
});

test('guests are redirected to the login page from dashboard routes', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
    $this->get(route('dashboard.executive'))->assertRedirect(route('login'));
    $this->get(route('dashboard.operations'))->assertRedirect(route('login'));
    $this->get(route('dashboard.workspace'))->assertRedirect(route('login'));
});

test('authenticated users can visit unified dashboard directly and receive deferred payload', function () {
    $user = User::factory()->create();
    $user->assignRole('super-admin');
    $group = NeedGroup::factory()->create(['year' => 2026, 'is_active' => true]);
    Need::factory()->count(2)->create(['need_group_id' => $group->id, 'total_price' => 1000]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard/index')
    );

    $version = $response->inertiaPage()['version'] ?? '';

    $partialResponse = $this->get(route('dashboard'), [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) $version,
        'X-Inertia-Partial-Component' => 'dashboard/index',
        'X-Inertia-Partial-Data' => 'dashboardPayload',
    ]);
    $partialResponse->assertOk();
    $partialResponse->assertJson(fn ($json) => $json
        ->has('props.dashboardPayload')
        ->etc()
    );
});

test('legacy dashboard routes redirect to unified dashboard preserving query parameters', function () {
    $user = User::factory()->create();
    $user->assignRole('super-admin');

    $this->actingAs($user);

    $this->get(route('dashboard.executive', ['need_group_id' => 99]))
        ->assertRedirect(route('dashboard', ['need_group_id' => 99]));

    $this->get(route('dashboard.operations', ['need_group_id' => 88]))
        ->assertRedirect(route('dashboard', ['need_group_id' => 88]));

    $this->get(route('dashboard.workspace', ['need_group_id' => 77]))
        ->assertRedirect(route('dashboard', ['need_group_id' => 77]));
});
