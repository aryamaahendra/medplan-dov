<?php

namespace Tests\Feature;

use App\Models\StrategicServicePlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

describe('StrategicServicePlanController', function () {
    pest()->use(RefreshDatabase::class);

    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    });

    it('can list strategic service plans', function () {
        StrategicServicePlan::factory()->count(3)->create();

        $response = $this->get(route('strategic-service-plans.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('strategic-plan/service-plans/index')
            ->has('plans.data', 3)
        );
    });

    it('can store a new strategic service plan', function () {
        $data = [
            'year' => 2025,
            'strategic_program' => 'Test Program',
            'service_plan' => 'Test Service Plan',
            'target' => 'Test Target',
            'policy_direction' => 'Test Policy Direction',
        ];

        $response = $this->post(route('strategic-service-plans.store'), $data);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $this->assertDatabaseHas('strategic_service_plans', [
            'strategic_program' => 'Test Program',
            'year' => 2025,
        ]);
    });

    it('validates store request', function () {
        $response = $this->post(route('strategic-service-plans.store'), []);

        $response->assertSessionHasErrors([
            'year',
            'strategic_program',
            'service_plan',
            'target',
            'policy_direction',
        ]);
    });

    it('can update a strategic service plan', function () {
        $plan = StrategicServicePlan::factory()->create(['strategic_program' => 'Old Program']);

        $response = $this->put(route('strategic-service-plans.update', $plan), [
            'strategic_program' => 'New Program',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $plan->refresh();
        expect($plan->strategic_program)->toBe('New Program');
    });

    it('can delete a strategic service plan', function () {
        $plan = StrategicServicePlan::factory()->create();

        $response = $this->delete(route('strategic-service-plans.destroy', $plan));

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $this->assertSoftDeleted('strategic_service_plans', ['id' => $plan->id]);
    });

    it('enforces year check constraint (year >= 2000)', function () {
        $data = StrategicServicePlan::factory()->raw(['year' => 1999]);

        // Laravel validation will catch this first
        $response = $this->post(route('strategic-service-plans.store'), $data);
        $response->assertSessionHasErrors(['year']);
    });
});
