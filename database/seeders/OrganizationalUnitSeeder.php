<?php

namespace Database\Seeders;

use App\Models\OrganizationalUnit;
use Illuminate\Database\Seeder;

class OrganizationalUnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hierarchy = [
            [
                'name' => 'Bagian Tata Usaha',
                'code' => 'TU',
                'children' => [
                    ['name' => 'Sub Bagian Kepegawaian & Umum', 'code' => 'TU.UM'],
                    ['name' => 'Sub Bagian Keuangan & Aset', 'code' => 'TU.KEU'],
                    ['name' => 'Sub Bagian Perencanaan Program', 'code' => 'TU.REN'],
                ],
            ],
            [
                'name' => 'Bidang Pelayanan Medik',
                'code' => 'PM',
                'children' => [
                    ['name' => 'Seksi Pengembangan Fasilitas & Rujukan', 'code' => 'PM.FAS'],
                    ['name' => 'Seksi Pengembangan & Pengendalian Mutu Pelayanan Medik', 'code' => 'PM.MUTU'],
                ],
            ],
            [
                'name' => 'Bidang Keperawatan',
                'code' => 'KEP',
                'children' => [
                    ['name' => 'Seksi Asuhan Keperawatan & Pengendalian Mutu Keperawatan', 'code' => 'KEP.MUTU'],
                    ['name' => 'Seksi Klinik Keperawatan', 'code' => 'KEP.KLINIK'],
                ],
            ],
            [
                'name' => 'Bidang Penunjang Medik & Non Medik',
                'code' => 'PNJ',
                'children' => [
                    ['name' => 'Seksi Penunjang Medik & Pengendalian Mutu Penunjang Medik', 'code' => 'PNJ.MED'],
                    ['name' => 'Seksi Penunjang Non Medik', 'code' => 'PNJ.NON'],
                ],
            ],
        ];

        foreach ($hierarchy as $parentData) {
            $parent = OrganizationalUnit::updateOrCreate(
                ['code' => $parentData['code']],
                ['name' => $parentData['name']]
            );

            foreach ($parentData['children'] as $childData) {
                OrganizationalUnit::updateOrCreate(
                    ['code' => $childData['code']],
                    [
                        'name' => $childData['name'],
                        'parent_id' => $parent->id,
                    ]
                );
            }
        }
    }
}
