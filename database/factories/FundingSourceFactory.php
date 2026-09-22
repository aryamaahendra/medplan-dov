<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\FundingSource;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FundingSource>
 */
class FundingSourceFactory extends Factory
{
    protected $model = FundingSource::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
        ];
    }
}
