<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedSasaransTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('sasarans')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('sasarans')->insert([

            0 => [
                'id' => 1,
                'tujuan_id' => 1,
                'name' => 'Tercapainya target Bed Occupacy Rate (BOR)',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
            1 => [
                'id' => 2,
                'tujuan_id' => 1,
                'name' => 'Pelayanan Pasien Secara Paripurna',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
            2 => [
                'id' => 3,
                'tujuan_id' => 1,
                'name' => 'Terpenuhinya ketersediaan sarana dan prasarana yang terstandarisasi',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
            3 => [
                'id' => 4,
                'tujuan_id' => 1,
                'name' => 'Terpenuhinya obat-obatan dan Bahan Medis Habis Pakai sesuai formularium rumah sakit',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
            4 => [
                'id' => 5,
                'tujuan_id' => 1,
                'name' => 'Meningkatnya kepuasan pasien',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
            5 => [
                'id' => 6,
                'tujuan_id' => 1,
                'name' => 'Meningkatnya kerjasama dengan stakeholder terkait',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
            6 => [
                'id' => 7,
                'tujuan_id' => 2,
                'name' => 'Terpenuhinya Sumber Daya Manusia Sesuai Kebutuhan dan standarisasi rumah sakit',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
            ],
            7 => [
                'id' => 8,
                'tujuan_id' => 2,
                'name' => 'Peningkatan Kompetensi, Keahlian dan Keterampilan Sumber Daya Manusia secara berkelanjutan',
                'description' => null,
                'created_at' => '2026-04-13 11:23:09',
                'updated_at' => '2026-04-13 11:23:09',
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('sasarans', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM sasarans;");
        }
    }
}
