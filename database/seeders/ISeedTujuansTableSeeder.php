<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedTujuansTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('tujuans')->delete();
        Schema::enableForeignKeyConstraints();

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

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('tujuans', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM tujuans;");
        }
    }
}
