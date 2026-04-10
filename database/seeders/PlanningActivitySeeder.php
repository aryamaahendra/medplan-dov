<?php

namespace Database\Seeders;

use App\Models\PlanningActivity;
use Illuminate\Database\Seeder;

class PlanningActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PlanningActivity::truncate();
        $data = [
            // Programs
            ['code' => '2.02.01', 'name' => 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH KABUPATEN/KOTA', 'type' => 'program'],
            ['code' => '2.02.05', 'name' => 'PROGRAM PENGEMBANGAN SISTEM DAN PENGELOLAAN PERSAMPAHAN', 'type' => 'program'],
            ['code' => '2.02.06', 'name' => 'PROGRAM PENGELOLAAN DAN PENGEMBANGAN SISTEM DRAINASE', 'type' => 'program'],
            ['code' => '2.02.07', 'name' => 'PROGRAM PENGELOLAAN DAN PENGEMBANGAN SISTEM AIR LIMBAH', 'type' => 'program'],
            ['code' => '2.02.08', 'name' => 'PROGRAM PENGEMBANGAN PERUMAHAN', 'type' => 'program'],
            ['code' => '2.02.09', 'name' => 'PROGRAM KAWASAN PERMUKIMAN', 'type' => 'program'],

            // Activities for 2.02.01
            ['code' => '2.02.01.2.01', 'name' => 'Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah', 'type' => 'activity', 'parent_code' => '2.02.01'],
            ['code' => '2.02.01.2.02', 'name' => 'Administrasi Keuangan Perangkat Daerah', 'type' => 'activity', 'parent_code' => '2.02.01'],
            ['code' => '2.02.01.2.05', 'name' => 'Administrasi Kepegawaian Perangkat Daerah', 'type' => 'activity', 'parent_code' => '2.02.01'],
            ['code' => '2.02.01.2.06', 'name' => 'Administrasi Umum Perangkat Daerah', 'type' => 'activity', 'parent_code' => '2.02.01'],
            ['code' => '2.02.01.2.07', 'name' => 'Pengadaan Barang Milik Daerah Penunjang Urusan Pemerintah Daerah', 'type' => 'activity', 'parent_code' => '2.02.01'],
            ['code' => '2.02.01.2.08', 'name' => 'Penyediaan Jasa Penunjang Urusan Pemerintahan Daerah', 'type' => 'activity', 'parent_code' => '2.02.01'],
            ['code' => '2.02.01.2.09', 'name' => 'Pemeliharaan Barang Milik Daerah Penunjang Urusan Pemerintahan Daerah', 'type' => 'activity', 'parent_code' => '2.02.01'],

            // Sub-Activities for 2.02.01.2.01
            ['code' => '2.02.01.2.01.01', 'name' => 'Penyusunan Dokumen Perencanaan Perangkat Daerah', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.01'],
            ['code' => '2.02.01.2.01.07', 'name' => 'Evaluasi Kinerja Perangkat Daerah', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.01'],

            // Sub-Activities for 2.02.01.2.02
            ['code' => '2.02.01.2.02.01', 'name' => 'Penyediaan Gaji dan Tunjangan ASN', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.02'],
            ['code' => '2.02.01.2.02.02', 'name' => 'Penyediaan Administrasi Pelaksanaan Tugas ASN', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.02'],
            ['code' => '2.02.01.2.02.03', 'name' => 'Pelaksanaan Penatausahaan dan Pengujian/Verifikasi Keuangan SKPD', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.02'],

            // Sub-Activities for 2.02.01.2.05
            ['code' => '2.02.01.2.05.02', 'name' => 'Pengadaan Pakaian Dinas Beserta Atribut Kelengkapannya', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.05'],
            ['code' => '2.02.01.2.05.09', 'name' => 'Pendidikan dan Pelatihan Pegawai Berdasarkan Tugas dan Fungsi', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.05'],
            ['code' => '2.02.01.2.05.11', 'name' => 'Sosialisasi dan Bimbingan Teknis Implementasi Peraturan Perundang-undangan', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.05'],

            // Sub-Activities for 2.02.01.2.06
            ['code' => '2.02.01.2.06.01', 'name' => 'Penyediaan Komponen Instalasi Listrik/Penerangan Bangunan Kantor', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.06'],
            ['code' => '2.02.01.2.06.02', 'name' => 'Penyediaan Peralatan dan Perlengkapan Kantor', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.06'],
            ['code' => '2.02.01.2.06.05', 'name' => 'Penyediaan Barang Cetakan dan Penggandaan', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.06'],
            ['code' => '2.02.01.2.06.09', 'name' => 'Penyelenggaraan Rapat Koordinasi dan Konsultasi SKPD', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.06'],

            // Sub-Activities for 2.02.01.2.07
            ['code' => '2.02.01.2.07.02', 'name' => 'Pengadaan Kendaraan Dinas Operasional atau Lapangan', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.07'],
            ['code' => '2.02.01.2.07.11', 'name' => 'Pengadaan Sarana dan Prasarana Gedung Kantor atau Bangunan Lainnya', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.07'],

            // Sub-Activities for 2.02.01.2.08
            ['code' => '2.02.01.2.08.01', 'name' => 'Penyediaan Jasa Surat Menyurat', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.08'],
            ['code' => '2.02.01.2.08.02', 'name' => 'Penyediaan Jasa Komunikasi, Sumber Daya Air dan Listrik', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.08'],
            ['code' => '2.02.01.2.08.03', 'name' => 'Penyediaan Jasa Peralatan dan Perlengkapan Kantor', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.08'],
            ['code' => '2.02.01.2.08.04', 'name' => 'Penyediaan Jasa Pelayanan Umum Kantor', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.08'],

            // Sub-Activities for 2.02.01.2.09
            ['code' => '2.02.01.2.09.01', 'name' => 'Penyediaan Jasa Pemeliharaan, Biaya Pemeliharaan dan Pajak Kendaraan Dinas Operasional atau Lapangan', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.09'],
            ['code' => '2.02.01.2.09.02', 'name' => 'Penyediaan Jasa Pemeliharaan, Biaya Pemeliharaan, Pajak, dan Perizinan Kendaraan Dinas Operasional atau Lapangan', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.09'],
            ['code' => '2.02.01.2.09.09', 'name' => 'Pemeliharaan/Rehabilitasi Gedung Kantor dan Bangunan Lainnya', 'type' => 'sub_activity', 'parent_code' => '2.02.01.2.09'],
        ];

        $created = [];

        foreach ($data as $item) {
            $parentId = null;
            if (isset($item['parent_code']) && isset($created[$item['parent_code']])) {
                $parentId = $created[$item['parent_code']];
            }

            $activity = PlanningActivity::create([
                'code' => $item['code'],
                'full_code' => $item['code'],
                'name' => $item['name'],
                'type' => $item['type'],
                'parent_id' => $parentId,
            ]);

            $created[$item['code']] = $activity->id;
        }
    }
}
