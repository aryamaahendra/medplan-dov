<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedStrategicServicePlansTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('strategic_service_plans')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('strategic_service_plans')->insert([

            0 => [
                'id' => 1,
                'year' => 2025,
                'strategic_program' => 'Pengembangan Layanan Bedah Minimal Invasif',
                'service_plan' => 'Pelayanan Laser Hemoroid',
                'target' => 'Tersedianya layanan laser hemoroid sesuai standar pelayanan rumah sakit',
                'policy_direction' => 'Peningkatan mutu pelayanan bedah dan daya saing rumah sakit',
                'created_at' => '2026-04-13 11:35:49',
                'updated_at' => '2026-04-13 11:35:49',
                'deleted_at' => null,
            ],
            1 => [
                'id' => 2,
                'year' => 2026,
                'strategic_program' => 'Pengembangan Layanan Jantung',
                'service_plan' => 'Pelayanan Jantung',
                'target' => 'Tersedianya Layana jantung Dasar',
                'policy_direction' => 'Pengembangan layanan jantung dasar secara bertahap untuk meningkatkan akses dan mutu pelayanan kesehatan jantung bagi masyarakat.',
                'created_at' => '2026-04-13 11:39:13',
                'updated_at' => '2026-04-13 11:39:13',
                'deleted_at' => null,
            ],
            2 => [
                'id' => 3,
                'year' => 2026,
                'strategic_program' => 'Pengembangan Layanan Kedokteran Gigi Spesialistik',
                'service_plan' => 'Pelayanan Laser Gigi',
                'target' => 'Tersedianya layanan laser gigi untuk meningkatkan mutu pelayanan odontologi',
                'policy_direction' => 'Pengembangan layanan kedokteran gigi spesialistik melalui penyediaan layanan laser gigi guna meningkatkan mutu pelayanan odontologi secara bertahap dan berkelanjutan.',
                'created_at' => '2026-04-13 11:40:11',
                'updated_at' => '2026-04-13 11:40:11',
                'deleted_at' => null,
            ],
            3 => [
                'id' => 4,
                'year' => 2027,
                'strategic_program' => 'Pengembangan Layanan Perawatan Instensif Anak (PICU)',
                'service_plan' => 'Pengembangan PICU',
                'target' => 'Tersedianya layanan intensif anak yang komprehensif, aman, dan bermutu sesuai standar',
                'policy_direction' => 'Pemenuhan sarana, prasarana, dan SDM layanan PICU sesuai standar untuk meningkatkan mutu dan keselamatan pelayanan intensif anak secara berkelanjutan.',
                'created_at' => '2026-04-13 11:40:53',
                'updated_at' => '2026-04-13 11:40:53',
                'deleted_at' => null,
            ],
            4 => [
                'id' => 5,
                'year' => 2027,
                'strategic_program' => 'Pengembangan Layanan Kateterisasi Jantung (Cathlab)',
                'service_plan' => 'Pengembangan Cathlab',
                'target' => 'Tersedianya layanan diagnostik dan tindakan jantung invasif secara cepat, aman, dan bermutu untuk mendukung pelayanan kardiovaskular rujukan.',
                'policy_direction' => 'Pemenuhan sarana, prasarana, dan SDM Cathlab sesuai standar untuk meningkatkan akses dan mutu pelayanan jantung invasif.',
                'created_at' => '2026-04-13 11:41:31',
                'updated_at' => '2026-04-13 11:41:31',
                'deleted_at' => null,
            ],
            5 => [
                'id' => 6,
                'year' => 2028,
                'strategic_program' => 'Penguatan Layanan Kegawatdaruratan dan Bedah Vaskular',
                'service_plan' => 'Pelayanan Trombektomi',
                'target' => 'Tersedianya layanan trombektomi untuk mendukung penanganan kegawatdaruratan dan kasus bedah vaskular secara cepat dan tepat.',
                'policy_direction' => 'Penguatan layanan kegawatdaruratan dan bedah vaskular melalui pengembangan pelayanan trombektomi secara bertahap guna meningkatkan mutu dan kecepatan pelayanan pasien.',
                'created_at' => '2026-04-13 11:42:08',
                'updated_at' => '2026-04-13 11:42:08',
                'deleted_at' => null,
            ],
            6 => [
                'id' => 7,
                'year' => 2028,
                'strategic_program' => 'Peningkatan Kelas dan Kapasitas Rumah Sakit',
                'service_plan' => 'Pengembangan Rumah Sakit ke Tipe B',
                'target' => 'Terpenuhinya persyaratan kelas RS Tipe B (SDM, sarpras, dan layanan)',
                'policy_direction' => 'Penguatan peran RS sebagai rumah sakit rujukan regional',
                'created_at' => '2026-04-13 11:42:42',
                'updated_at' => '2026-04-13 11:42:42',
                'deleted_at' => null,
            ],
            7 => [
                'id' => 8,
                'year' => 2029,
                'strategic_program' => 'Optimalisasi dan Penguatan Layanan Unggulan',
                'service_plan' => 'Optimalisasi seluruh layanan yang telah dikembangkan',
                'target' => 'Berfungsinya layanan unggulan secara optimal dan berkelanjutan',
                'policy_direction' => 'Penjaminan mutu layanan dan keberlanjutan pengembangan',
                'created_at' => '2026-04-13 11:43:21',
                'updated_at' => '2026-04-13 11:43:21',
                'deleted_at' => null,
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('strategic_service_plans', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM strategic_service_plans;");
        }
    }
}
