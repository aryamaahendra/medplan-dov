<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedNeedGroupsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('need_groups')->delete();

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

    }
}
