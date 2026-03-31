<?php

namespace Database\Factories;

use App\Enums\Impact;
use App\Enums\Urgency;
use App\Models\Need;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Need>
 */
class NeedFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $volume = $this->faker->randomFloat(2, 1, 100);
        $unitPrice = $this->faker->randomFloat(2, 10000, 5000000);

        return [
            'organizational_unit_id' => OrganizationalUnit::factory(),
            'need_type_id' => NeedType::factory(),
            'year' => $this->faker->numberBetween(2024, 2027),
            'title' => $this->faker->sentence(5),
            'description' => $this->faker->optional()->paragraph(),
            'current_condition' => $this->faker->optional()->paragraph(),
            'required_condition' => $this->faker->optional()->paragraph(),
            'volume' => $volume,
            'unit' => $this->faker->randomElement(['pcs', 'unit', 'orang', 'paket', 'set', 'buah', 'lembar', 'kg', 'liter', 'meter']),
            'unit_price' => $unitPrice,
            'total_price' => round($volume * $unitPrice, 2),
            'urgency' => $this->faker->randomElement(Urgency::cases()),
            'impact' => $this->faker->randomElement(Impact::cases()),
            'is_priority' => $this->faker->boolean(20), // 20% chance to be true
            'status' => $this->faker->randomElement(['draft', 'submitted', 'approved', 'rejected']),
        ];
    }
}
