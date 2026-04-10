<?php

namespace Database\Factories;

use App\Models\PlanningRevisionGroup;
use App\Models\PlanningVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PlanningRevisionGroup>
 */
class PlanningRevisionGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'planning_version_id' => PlanningVersion::factory(),
            'code' => 'REV-'.$year = fake()->year().'-'.fake()->numberBetween(1, 99),
            'name' => 'Revision Group '.fake()->word(),
            'description' => fake()->paragraph(),
            'parent_group_id' => null,
        ];
    }
}
