<?php

namespace Database\Factories;

use App\Models\Indicator;
use App\Models\Renstra;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Indicator>
 */
class IndicatorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'renstra_id' => Renstra::factory(),
            'name' => $this->faker->sentence(3),
            'baseline' => $this->faker->randomDigit().'%',
            'description' => $this->faker->paragraph(),
        ];
    }
}
