<?php

namespace Database\Seeders;

use App\Models\Indicator;
use App\Models\Renstra;
use Illuminate\Database\Seeder;

class IndicatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $renstras = Renstra::all();

        if ($renstras->isEmpty()) {
            $renstras = Renstra::factory()->count(2)->create();
        }

        foreach ($renstras as $renstra) {
            Indicator::factory()
                ->count(3)
                ->create([
                    'renstra_id' => $renstra->id,
                ]);
        }
    }
}
