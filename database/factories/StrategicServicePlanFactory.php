<?php

namespace Database\Factories;

use App\Models\StrategicServicePlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StrategicServicePlan>
 */
class StrategicServicePlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'year' => fake()->numberBetween(2025, 2030),
            'strategic_program' => fake()->sentence(3),
            'service_plan' => fake()->sentence(5),
            'target' => fake()->sentence(5),
            'policy_direction' => fake()->paragraph(),
        ];
    }
}
