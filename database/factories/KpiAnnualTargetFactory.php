<?php

namespace Database\Factories;

use App\Models\KpiAnnualTarget;
use App\Models\KpiIndicator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KpiAnnualTarget>
 */
class KpiAnnualTargetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'indicator_id' => KpiIndicator::factory(),
            'year' => (int) $this->faker->year(),
            'target_value' => (string) $this->faker->numberBetween(1, 100),
        ];
    }
}
