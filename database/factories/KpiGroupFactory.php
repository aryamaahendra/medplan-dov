<?php

namespace Database\Factories;

use App\Models\KpiGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<KpiGroup>
 */
class KpiGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startYear = $this->faker->year();

        return [
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'start_year' => (int) $startYear,
            'end_year' => (int) $startYear + 5,
            'is_active' => false,
        ];
    }

    /**
     * @return $this
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * @return $this
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
