<?php

namespace Database\Factories;

use App\Models\Sasaran;
use App\Models\Tujuan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sasaran>
 */
class SasaranFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tujuan_id' => Tujuan::factory(),
            'name' => 'Sasaran: '.$this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
        ];
    }
}
