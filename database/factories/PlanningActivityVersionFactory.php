<?php

namespace Database\Factories;

use App\Models\PlanningActivity;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningRevisionGroup;
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
            'revision_group_id' => PlanningRevisionGroup::factory(),
            'source_activity_id' => PlanningActivity::factory(),
            'parent_id' => null,
            'code' => fake()->unique()->numerify('1.##.##.##.####'),
            'name' => fake()->sentence(),
            'type' => fake()->randomElement(['program', 'activity', 'sub_activity', 'output']),
            'full_code' => fake()->unique()->numerify('1.##.##.##.####'),
            'indicator_name' => fake()->sentence(),
            'indicator_baseline_2024' => fake()->numberBetween(1, 100),
            'perangkat_daerah' => fake()->company(),
            'keterangan' => fake()->paragraph(),
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
