<?php

namespace Database\Seeders;

use App\Models\FundingSource;
use Illuminate\Database\Seeder;

class FundingSourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = [
            'APBD',
            'BLUD',
            'DAK',
            'PHLN',
            'Sponsorship',
        ];

        foreach ($sources as $source) {
            FundingSource::firstOrCreate(['name' => $source]);
        }
    }
}
