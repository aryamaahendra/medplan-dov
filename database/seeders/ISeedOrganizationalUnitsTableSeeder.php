<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedOrganizationalUnitsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('organizational_units')->delete();

        \DB::table('organizational_units')->insert([
            0 => [
                'id' => 1,
                'name' => 'Bagian Tata Usaha',
                'code' => 'TU',
                'parent_id' => null,
                'created_at' => '2026-04-13 10:50:21',
                'updated_at' => '2026-04-13 10:50:21',
                'deleted_at' => null,
            ],
            1 => [
                'id' => 6,
                'name' => 'Sub Bagian Keuangan & Aset',
                'code' => 'TU.KEU',
                'parent_id' => 1,
                'created_at' => '2026-04-13 11:17:54',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            2 => [
                'id' => 7,
                'name' => 'Sub Bagian Perencanaan Program',
                'code' => 'TU.REN',
                'parent_id' => 1,
                'created_at' => '2026-04-13 11:17:54',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            3 => [
                'id' => 2,
                'name' => 'Bidang Pelayanan Medik',
                'code' => 'PM',
                'parent_id' => null,
                'created_at' => '2026-04-13 10:50:21',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            4 => [
                'id' => 8,
                'name' => 'Seksi Pengembangan Fasilitas & Rujukan',
                'code' => 'PM.FAS',
                'parent_id' => 2,
                'created_at' => '2026-04-13 11:17:54',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            5 => [
                'id' => 9,
                'name' => 'Seksi Pengembangan & Pengendalian Mutu Pelayanan Medik',
                'code' => 'PM.MUTU',
                'parent_id' => 2,
                'created_at' => '2026-04-13 11:17:54',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            6 => [
                'id' => 3,
                'name' => 'Bidang Keperawatan',
                'code' => 'KEP',
                'parent_id' => null,
                'created_at' => '2026-04-13 10:50:21',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            7 => [
                'id' => 10,
                'name' => 'Seksi Asuhan Keperawatan & Pengendalian Mutu Keperawatan',
                'code' => 'KEP.MUTU',
                'parent_id' => 3,
                'created_at' => '2026-04-13 11:17:54',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            8 => [
                'id' => 11,
                'name' => 'Seksi Klinik Keperawatan',
                'code' => 'KEP.KLINIK',
                'parent_id' => 3,
                'created_at' => '2026-04-13 11:17:54',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            9 => [
                'id' => 4,
                'name' => 'Bidang Penunjang Medik & Non Medik',
                'code' => 'PNJ',
                'parent_id' => null,
                'created_at' => '2026-04-13 10:50:21',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            10 => [
                'id' => 12,
                'name' => 'Seksi Penunjang Medik & Pengendalian Mutu Penunjang Medik',
                'code' => 'PNJ.MED',
                'parent_id' => 4,
                'created_at' => '2026-04-13 11:17:54',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            11 => [
                'id' => 13,
                'name' => 'Seksi Penunjang Non Medik',
                'code' => 'PNJ.NON',
                'parent_id' => 4,
                'created_at' => '2026-04-13 11:17:54',
                'updated_at' => '2026-04-13 11:17:54',
                'deleted_at' => null,
            ],
            12 => [
                'id' => 5,
                'name' => 'Sub Bagian Kepegawaian & Umum',
                'code' => 'TU.KU',
                'parent_id' => 1,
                'created_at' => '2026-04-13 11:17:54',
                'updated_at' => '2026-04-13 11:18:55',
                'deleted_at' => null,
            ],
        ]);

    }
}
