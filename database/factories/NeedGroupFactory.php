<?php

namespace Database\Factories;

use App\Models\NeedGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NeedGroup>
 */
class NeedGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->optional()->paragraph(),
            'year' => $this->faker->numberBetween(2024, 2027),
            'is_active' => $this->faker->boolean(80),
            'need_count' => 0,
        ];
    }

    /**
     * Indicate that the need group has an open submission window.
     */
    public function openWindow(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'submission_start_at' => now()->subDays(5),
            'submission_end_at' => now()->addDays(5),
        ]);
    }

    /**
     * Indicate that the need group has a closed submission window.
     */
    public function closedWindow(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'submission_start_at' => now()->subDays(10),
            'submission_end_at' => now()->subDay(),
        ]);
    }
}
