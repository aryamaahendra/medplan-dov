<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedIndicatorsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('indicators')->delete();

        \DB::table('indicators')->insert([
            0 => [
                'id' => 1,
                'tujuan_id' => 1,
                'name' => 'Nilai SAKIP',
                'baseline' => '50',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
                'sasaran_id' => null,
            ],
            1 => [
                'id' => 2,
                'tujuan_id' => null,
                'name' => 'Angka BOR',
                'baseline' => '44.70%',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
                'sasaran_id' => 1,
            ],
            2 => [
                'id' => 3,
                'tujuan_id' => null,
                'name' => 'Akreditasi Paripurna',
                'baseline' => 'Paripurna',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
                'sasaran_id' => 2,
            ],
            3 => [
                'id' => 4,
                'tujuan_id' => null,
                'name' => 'Nilai ASPAK',
                'baseline' => '65',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
                'sasaran_id' => 3,
            ],
            4 => [
                'id' => 5,
                'tujuan_id' => null,
                'name' => 'Formalarium Rumah Sakit',
                'baseline' => '100%',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
                'sasaran_id' => 4,
            ],
            5 => [
                'id' => 6,
                'tujuan_id' => null,
                'name' => 'Indeks Kepuasan Masyarakat',
                'baseline' => '86',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
                'sasaran_id' => 5,
            ],
            6 => [
                'id' => 7,
                'tujuan_id' => null,
                'name' => 'Jumlah MOU',
                'baseline' => '5 MOU',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
                'sasaran_id' => 6,
            ],
            7 => [
                'id' => 8,
                'tujuan_id' => 2,
                'name' => 'Persentase SDM Kesehatan yang memiliki STR dan SIP yang masih berlaku',
                'baseline' => '100%',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
                'sasaran_id' => null,
            ],
            8 => [
                'id' => 9,
                'tujuan_id' => null,
                'name' => 'Persentase SDM Kesehatan yang tersedia dengan yang dibutuhkan sesuai standar rumah sakit',
                'baseline' => '69%',
                'description' => null,
                'created_at' => '2026-04-13 11:23:08',
                'updated_at' => '2026-04-13 11:23:08',
                'sasaran_id' => 7,
            ],
            9 => [
                'id' => 10,
                'tujuan_id' => null,
                'name' => 'Persentase SDM Kesehatan yang memiliki sertifikat sesuai kompetensi',
                'baseline' => '38%',
                'description' => null,
                'created_at' => '2026-04-13 11:23:09',
                'updated_at' => '2026-04-13 11:23:09',
                'sasaran_id' => 8,
            ],
        ]);

    }
}
