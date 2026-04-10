<?php

namespace Database\Factories;

use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PlanningActivityYear>
 */
class PlanningActivityYearFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'planning_activity_version_id' => PlanningActivityVersion::factory(),
            'year' => fake()->year(),
            'target' => fake()->numberBetween(1, 100).' %',
            'budget' => fake()->randomFloat(2, 1000000, 1000000000),
        ];
    }
}
