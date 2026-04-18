<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedNeedIndicatorTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('need_indicator')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('need_indicator')->insert([

            0 => [
                'id' => 1,
                'need_id' => 1,
                'indicator_id' => 3,
                'created_at' => null,
                'updated_at' => null,
            ],
            1 => [
                'id' => 2,
                'need_id' => 1,
                'indicator_id' => 4,
                'created_at' => null,
                'updated_at' => null,
            ],
            2 => [
                'id' => 3,
                'need_id' => 1,
                'indicator_id' => 2,
                'created_at' => null,
                'updated_at' => null,
            ],
            3 => [
                'id' => 4,
                'need_id' => 1,
                'indicator_id' => 6,
                'created_at' => null,
                'updated_at' => null,
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('need_indicator', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM need_indicator;");
        }
    }
}
