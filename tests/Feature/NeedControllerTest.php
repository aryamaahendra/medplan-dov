<?php

use App\Enums\Impact;
use App\Enums\Urgency;
use App\Models\Indicator;
use App\Models\KpiGroup;
use App\Models\KpiIndicator;
use App\Models\Need;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\Sasaran;
use App\Models\StrategicServicePlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->be($this->user);
});

it('can store a need with kpi indicators and strategic service plans', function () {
    $unit = OrganizationalUnit::factory()->create();
    $type = NeedType::factory()->create();
    $sasaran = Sasaran::factory()->create();
    $renstraIndicator = Indicator::factory()->create(['sasaran_id' => $sasaran->id]);

    $kpiGroup = KpiGroup::factory()->active()->create();
    $kpiIndicator = KpiIndicator::factory()->create(['group_id' => $kpiGroup->id]);

    $strategicPlan = StrategicServicePlan::factory()->create(['year' => 2026]);

    $data = [
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $type->id,
        'year' => 2026,
        'title' => 'Test Need',
        'description' => 'Test Description',
        'volume' => 10,
        'unit' => 'unit',
        'unit_price' => 1000,
        'total_price' => 10000,
        'urgency' => Urgency::Medium->value,
        'impact' => Impact::Medium->value,
        'is_priority' => true,
        'status' => 'draft',
        'sasaran_ids' => [$sasaran->id],
        'indicator_ids' => [$renstraIndicator->id],
        'kpi_indicator_ids' => [$kpiIndicator->id],
        'strategic_service_plan_ids' => [$strategicPlan->id],
    ];

    $response = $this->post(route('needs.store'), $data);

    $response->assertRedirect(route('needs.index'));

    $need = Need::where('title', 'Test Need')->first();
    expect($need->kpiIndicators)->toHaveCount(1)
        ->and($need->kpiIndicators->first()->id)->toBe($kpiIndicator->id)
        ->and($need->strategicServicePlans)->toHaveCount(1)
        ->and($need->strategicServicePlans->first()->id)->toBe($strategicPlan->id);
});

it('can update a need with kpi indicators and strategic service plans', function () {
    $need = Need::factory()->create();

    $sasaran = Sasaran::factory()->create();
    $renstraIndicator = Indicator::factory()->create(['sasaran_id' => $sasaran->id]);
    $kpiGroup = KpiGroup::factory()->active()->create();
    $kpiIndicator = KpiIndicator::factory()->create(['group_id' => $kpiGroup->id]);
    $strategicPlan = StrategicServicePlan::factory()->create();

    $data = [
        'organizational_unit_id' => $need->organizational_unit_id,
        'need_type_id' => $need->need_type_id,
        'year' => 2026,
        'title' => 'Updated Need',
        'volume' => 5,
        'unit' => 'unit',
        'unit_price' => 2000,
        'total_price' => 10000,
        'urgency' => Urgency::High->value,
        'impact' => Impact::High->value,
        'sasaran_ids' => [$sasaran->id],
        'indicator_ids' => [$renstraIndicator->id],
        'kpi_indicator_ids' => [$kpiIndicator->id],
        'strategic_service_plan_ids' => [$strategicPlan->id],
    ];

    $response = $this->patch(route('needs.update', $need), $data);

    $response->assertRedirect(route('needs.index'));

    $need->refresh();
    expect($need->title)->toBe('Updated Need')
        ->and($need->kpiIndicators)->toHaveCount(1)
        ->and($need->strategicServicePlans)->toHaveCount(1);
});

it('provides active kpi groups and strategic plans to create view', function () {
    KpiGroup::factory()->active()->create(['name' => 'Active Group']);
    KpiGroup::factory()->inactive()->create(['name' => 'Inactive Group']);
    StrategicServicePlan::factory()->create(['strategic_program' => 'Strategic Program X']);

    $response = $this->get(route('needs.create'));

    $response->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('needs/create')
            ->has('kpiGroups', 1)
            ->where('kpiGroups.0.name', 'Active Group')
            ->has('strategicServicePlans', 1)
            ->where('strategicServicePlans.0.strategic_program', 'Strategic Program X')
        );
});
