<?php

namespace Database\Factories;

use App\Models\Indicator;
use App\Models\Sasaran;
use App\Models\Tujuan;
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
        $forTujuan = $this->faker->boolean();

        return [
            'tujuan_id' => $forTujuan ? Tujuan::factory() : null,
            'sasaran_id' => ! $forTujuan ? Sasaran::factory() : null,
            'name' => $this->faker->sentence(3),
            'baseline' => $this->faker->randomDigit().'%',
            'description' => $this->faker->paragraph(),
        ];
    }
}
