<?php

namespace Database\Seeders;

use App\Models\NeedType;
use Illuminate\Database\Seeder;

class NeedTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['name' => 'SDM', 'code' => 'SDM', 'order_column' => 1],
            ['name' => 'ALKES', 'code' => 'ALKES', 'order_column' => 2],
            ['name' => 'PERSEDIAAN', 'code' => 'PERSEDIAAN', 'order_column' => 3],
            ['name' => 'SARANA', 'code' => 'SARANA', 'order_column' => 4],
        ];

        foreach ($types as $type) {
            NeedType::updateOrCreate(
                ['code' => $type['code']],
                [
                    'name' => $type['name'],
                    'order_column' => $type['order_column'],
                    'is_active' => true,
                    'description' => 'Jenis kebutuhan '.$type['name'],
                ]
            );
        }
    }
}
