<?php

namespace Database\Seeders;

use App\Models\Renstra;
use App\Models\Tujuan;
use Illuminate\Database\Seeder;

class TujuanSeeder extends Seeder
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
            Tujuan::factory()
                ->count(3)
                ->create([
                    'renstra_id' => $renstra->id,
                ]);
        }
    }
}
