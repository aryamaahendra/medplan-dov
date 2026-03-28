<?php

namespace Database\Factories;

use App\Models\OrganizationalUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrganizationalUnit>
 */
class OrganizationalUnitFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'code' => strtoupper(fake()->unique()->lexify('???-###')),
            'parent_id' => null,
        ];
    }
}
