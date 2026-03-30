<?php

namespace Database\Factories;

use App\Models\Renstra;
use App\Models\Tujuan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tujuan>
 */
class TujuanFactory extends Factory
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
            'name' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
        ];
    }
}
