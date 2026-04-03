<?php

namespace Tests\Feature;

use App\Models\KpiGroup;
use App\Models\KpiIndicator;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

describe('KpiIndicatorController', function () {
    pest()->use(RefreshDatabase::class);

    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        $this->group = KpiGroup::factory()->create([
            'start_year' => 2025,
            'end_year' => 2030,
        ]);
    });

    it('can store a new kpi indicator with targets', function () {
        $data = [
            'group_id' => $this->group->id,
            'name' => 'Test Indicator',
            'unit' => '%',
            'baseline_value' => '80',
            'annual_targets' => [
                ['year' => 2025, 'target_value' => '82'],
                ['year' => 2026, 'target_value' => '84'],
            ],
        ];

        $response = $this->post(route('kpis.indicators.store'), $data);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('kpi_indicators', ['name' => 'Test Indicator']);
        $this->assertDatabaseHas('kpi_annual_targets', ['year' => 2025, 'target_value' => '82']);
        $this->assertDatabaseHas('kpi_annual_targets', ['year' => 2026, 'target_value' => '84']);
    });

    it('can store a category indicator without targets', function () {
        $data = [
            'group_id' => $this->group->id,
            'name' => 'Test Category',
            'is_category' => true,
        ];

        $response = $this->post(route('kpis.indicators.store'), $data);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('kpi_indicators', ['name' => 'Test Category', 'is_category' => true]);
    });

    it('prohibits unit and baseline for category indicators', function () {
        $data = [
            'group_id' => $this->group->id,
            'name' => 'Invalid Category',
            'is_category' => true,
            'unit' => '%',
            'baseline_value' => '80',
        ];

        $response = $this->post(route('kpis.indicators.store'), $data);

        $response->assertSessionHasErrors(['unit', 'baseline_value']);
    });

    it('can update a kpi indicator and sync targets', function () {
        $indicator = KpiIndicator::factory()->create([
            'group_id' => $this->group->id,
            'name' => 'Old Name',
        ]);
        $indicator->annualTargets()->create(['year' => 2025, 'target_value' => '80']);

        $data = [
            'group_id' => $this->group->id,
            'name' => 'New Name',
            'annual_targets' => [
                ['year' => 2025, 'target_value' => '85'],
                ['year' => 2026, 'target_value' => '90'],
            ],
        ];

        $response = $this->put(route('kpis.indicators.update', $indicator), $data);

        $response->assertSessionHasNoErrors();
        $indicator->refresh();
        expect($indicator->name)->toBe('New Name');
        $this->assertDatabaseHas('kpi_annual_targets', ['indicator_id' => $indicator->id, 'year' => 2025, 'target_value' => '85']);
        $this->assertDatabaseHas('kpi_annual_targets', ['indicator_id' => $indicator->id, 'year' => 2026, 'target_value' => '90']);
    });

    it('can delete a kpi indicator', function () {
        $indicator = KpiIndicator::factory()->create(['group_id' => $this->group->id]);

        $response = $this->delete(route('kpis.indicators.destroy', $indicator));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('kpi_indicators', ['id' => $indicator->id]);
    });
});
