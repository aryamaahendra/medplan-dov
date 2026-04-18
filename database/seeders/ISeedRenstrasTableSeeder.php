<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedRenstrasTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('renstras')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('renstras')->insert([

            0 => [
                'id' => 1,
                'name' => 'Renstra RSUD 2025-2030',
                'year_start' => 2025,
                'year_end' => 2030,
                'description' => 'Rencana Strategis RSUD Tahunan 2025-2030',
                'is_active' => true,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('renstras', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM renstras;");
        }
    }
}
