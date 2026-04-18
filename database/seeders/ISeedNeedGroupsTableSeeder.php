<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedNeedGroupsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('need_groups')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('need_groups')->insert([

            0 => [
                'id' => 1,
                'name' => 'Usulan Awal',
                'description' => 'RKA Penyusunan Tahun 2026',
                'year' => 2026,
                'is_active' => true,
                'need_count' => 3,
                'created_at' => '2026-04-13 11:49:01',
                'updated_at' => '2026-04-13 12:08:39',
                'deleted_at' => null,
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('need_groups', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM need_groups;");
        }
    }
}
