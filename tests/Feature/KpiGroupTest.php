<?php

namespace Tests\Feature;

use App\Models\KpiGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

describe('KpiGroupController', function () {
    pest()->use(RefreshDatabase::class);

    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    });

    it('can list kpi groups', function () {
        KpiGroup::factory()->count(3)->create();

        $response = $this->get(route('kpis.groups.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('kpi/groups/index', false)
            ->has('groups.data', 3)
        );
    });

    it('can store a new kpi group', function () {
        $data = [
            'name' => 'Test Group',
            'start_year' => 2025,
            'end_year' => 2030,
            'is_active' => true,
        ];

        $response = $this->post(route('kpis.groups.store'), $data);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('kpi_groups', ['name' => 'Test Group', 'is_active' => true]);
    });

    it('enforces single active group when storing', function () {
        $activeGroup = KpiGroup::factory()->create(['is_active' => true]);

        $data = [
            'name' => 'New Active Group',
            'start_year' => 2025,
            'end_year' => 2030,
            'is_active' => true,
        ];

        $this->post(route('kpis.groups.store'), $data);

        $activeGroup->refresh();
        expect($activeGroup->is_active)->toBeFalse();
        $this->assertDatabaseHas('kpi_groups', ['name' => 'New Active Group', 'is_active' => true]);
    });

    it('can update a kpi group', function () {
        $group = KpiGroup::factory()->create(['name' => 'Old Name']);

        $response = $this->put(route('kpis.groups.update', $group), [
            'name' => 'New Name',
            'start_year' => 2025,
            'end_year' => 2030,
        ]);

        $response->assertSessionHasNoErrors();
        $group->refresh();
        expect($group->name)->toBe('New Name');
    });

    it('can delete a kpi group', function () {
        $group = KpiGroup::factory()->create();

        $response = $this->delete(route('kpis.groups.destroy', $group));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('kpi_groups', ['id' => $group->id]);
    });

    it('can activate a kpi group via dedicated route', function () {
        $activeGroup = KpiGroup::factory()->create(['is_active' => true]);
        $inactiveGroup = KpiGroup::factory()->create(['is_active' => false]);

        $response = $this->post(route('kpis.groups.activate', $inactiveGroup));

        $response->assertSessionHasNoErrors();
        $activeGroup->refresh();
        $inactiveGroup->refresh();

        expect($activeGroup->is_active)->toBeFalse();
        expect($inactiveGroup->is_active)->toBeTrue();
    });
});
