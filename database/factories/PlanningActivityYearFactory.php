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
        $activity = PlanningActivityVersion::factory()->create();

        return [
            'yearable_id' => $activity->id,
            'yearable_type' => PlanningActivityVersion::class,
            'year' => fake()->year(),
            'target' => null,
            'budget' => fake()->randomFloat(2, 1000000, 1000000000),
        ];
    }
}
