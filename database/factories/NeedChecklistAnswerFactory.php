<?php

namespace Database\Factories;

use App\Models\ChecklistQuestion;
use App\Models\Need;
use App\Models\NeedChecklistAnswer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NeedChecklistAnswer>
 */
class NeedChecklistAnswerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'need_id' => Need::factory(),
            'checklist_question_id' => ChecklistQuestion::factory(),
            'answer' => $this->faker->randomElement(['yes', 'no', 'skip']),
            'notes' => $this->faker->sentence(),
        ];
    }
}
