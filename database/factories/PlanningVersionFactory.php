<?php

namespace Database\Factories;

use App\Models\PlanningVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PlanningVersion>
 */
class PlanningVersionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'RKPD '.$yearStart = fake()->year(),
            'year_start' => $yearStart,
            'year_end' => $yearStart + 4,
            'revision_no' => fake()->numberBetween(1, 10),
            'status' => fake()->randomElement(['draft', 'submitted', 'approved', 'archived']),
            'is_current' => false,
            'notes' => fake()->sentence(),
        ];
    }
}
