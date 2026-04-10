<?php

namespace Database\Factories;

use App\Models\PlanningActivity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PlanningActivity>
 */
class PlanningActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->numerify('1.##.##.##.####'),
            'name' => fake()->sentence(),
            'type' => fake()->randomElement(['program', 'activity', 'sub_activity', 'output']),
            'full_code' => fake()->unique()->numerify('1.##.##.##.####'),
        ];
    }
}
