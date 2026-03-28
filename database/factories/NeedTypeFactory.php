<?php

namespace Database\Factories;

use App\Models\NeedType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NeedType>
 */
class NeedTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'code' => $this->faker->unique()->lexify('????'),
            'description' => $this->faker->sentence(),
            'is_active' => true,
            'order_column' => 0,
        ];
    }
}
