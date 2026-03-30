<?php

namespace Database\Seeders;

use App\Models\Sasaran;
use App\Models\Tujuan;
use Illuminate\Database\Seeder;

class SasaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tujuans = Tujuan::all();

        if ($tujuans->isEmpty()) {
            return;
        }

        foreach ($tujuans as $tujuan) {
            Sasaran::factory(3)->create([
                'tujuan_id' => $tujuan->id,
            ]);
        }
    }
}
