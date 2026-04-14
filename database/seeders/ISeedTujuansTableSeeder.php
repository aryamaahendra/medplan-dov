<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedTujuansTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('tujuans')->delete();

        \DB::table('tujuans')->insert([
            0 => [
                'id' => 1,
                'renstra_id' => 1,
                'name' => 'Meningkatkan kualitas pelayanan kesehatan secara berkesinambungan',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
            1 => [
                'id' => 2,
                'renstra_id' => 1,
                'name' => 'Mewujudkan sumber manusia kesehatan dengan kompetensi sesuai standar',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
        ]);

    }
}
