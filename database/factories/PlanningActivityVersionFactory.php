<?php

namespace Database\Factories;

use App\Enums\PlanningActivityType;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PlanningActivityVersion>
 */
class PlanningActivityVersionFactory extends Factory
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
            'parent_id' => null,
            'code' => $code = fake()->unique()->numerify('1.##.##.##.####'),
            'type' => fake()->randomElement(PlanningActivityType::cases()),
            'name' => fake()->sentence(),
            'full_code' => $code,
            'perangkat_daerah' => fake()->company(),
            'keterangan' => fake()->paragraph(),
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
