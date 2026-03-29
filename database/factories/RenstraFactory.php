<?php

namespace Database\Factories;

use App\Models\Renstra;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Renstra>
 */
class RenstraFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $yearStart = $this->faker->numberBetween(2020, 2030);
        $yearEnd = $yearStart + 4;

        return [
            'name' => 'Renstra '.$yearStart.'-'.$yearEnd,
            'year_start' => $yearStart,
            'year_end' => $yearEnd,
            'description' => $this->faker->sentence(10),
            'is_active' => false,
        ];
    }
}
