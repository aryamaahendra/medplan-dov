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
}
