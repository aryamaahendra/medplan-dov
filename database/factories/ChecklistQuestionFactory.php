<?php

namespace Database\Factories;

use App\Models\ChecklistQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ChecklistQuestion>
 */
class ChecklistQuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'question' => $this->faker->sentence().'?',
            'description' => $this->faker->paragraph(),
            'is_active' => true,
            'order_column' => 0,
        ];
    }
}
