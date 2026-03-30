<?php

namespace Database\Seeders;

use App\Models\Indicator;
use App\Models\Tujuan;
use Illuminate\Database\Seeder;

class IndicatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tujuans = Tujuan::all();

        if ($tujuans->isEmpty()) {
            $tujuans = Tujuan::factory()->count(2)->create();
        }

        foreach ($tujuans as $tujuan) {
            Indicator::factory()
                ->count(3)
                ->create([
                    'tujuan_id' => $tujuan->id,
                ]);
        }
    }
}
