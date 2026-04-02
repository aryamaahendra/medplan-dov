<?php

namespace Database\Factories;

use App\Models\KpiGroup;
use App\Models\KpiIndicator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KpiIndicator>
 */
class KpiIndicatorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'group_id' => KpiGroup::factory(),
            'parent_indicator_id' => null,
            'name' => $this->faker->sentence(4),
            'unit' => $this->faker->randomElement(['%', 'Score', 'Index', 'People']),
            'is_category' => false,
            'baseline_value' => (string) $this->faker->numberBetween(1, 100),
        ];
    }

    public function category(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_category' => true,
            'unit' => null,
            'baseline_value' => null,
        ]);
    }
}
