<?php

namespace Database\Seeders;

use App\Models\StrategicServicePlan;
use Illuminate\Database\Seeder;

class StrategicServicePlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'year' => 2025,
                'strategic_program' => 'Pengembangan Layanan Bedah Minimal Invasif',
                'service_plan' => 'Pelayanan Laser Hemoroid',
                'target' => 'Tersedianya layanan laser hemoroid sesuai standar pelayanan rumah sakit',
                'policy_direction' => 'Peningkatan mutu pelayanan bedah dan daya saing rumah sakit',
            ],
            [
                'year' => 2026,
                'strategic_program' => 'Pengembangan Layanan Jantung',
                'service_plan' => 'Pelayanan Jantung',
                'target' => 'Tersedianya layanan jantung dasar',
                'policy_direction' => 'Pengembangan layanan jantung dasar secara bertahap untuk meningkatkan akses dan mutu pelayanan kesehatan jantung bagi masyarakat.',
            ],
            [
                'year' => 2026,
                'strategic_program' => 'Pengembangan Layanan Kedokteran Gigi Spesialistik',
                'service_plan' => 'Pelayanan Laser Gigi',
                'target' => 'Tersedianya layanan laser gigi untuk meningkatkan mutu pelayanan odontologi',
                'policy_direction' => 'Pengembangan layanan kedokteran gigi spesialistik melalui penyediaan layanan laser gigi guna meningkatkan mutu pelayanan odontologi secara bertahap dan berkelanjutan.',
            ],
            [
                'year' => 2027,
                'strategic_program' => 'Pengembangan Layanan Perawatan Intensif Anak (PICU)',
                'service_plan' => 'Pengembangan PICU',
                'target' => 'Tersedianya layanan intensif anak yang komprehensif, aman, dan bermutu sesuai standar',
                'policy_direction' => 'Pemenuhan sarana, prasarana, dan SDM layanan PICU sesuai standar untuk meningkatkan mutu dan keselamatan pelayanan intensif anak secara berkelanjutan.',
            ],
            [
                'year' => 2027,
                'strategic_program' => 'Pengembangan Layanan Kateterisasi Jantung (Cathlab)',
                'service_plan' => 'Pengembangan Cathlab',
                'target' => 'Tersedianya layanan diagnostik dan tindakan jantung invasif secara cepat, aman, dan bermutu untuk mendukung pelayanan kardiovaskular rujukan.',
                'policy_direction' => 'Pemenuhan sarana, prasarana, dan SDM Cathlab sesuai standar untuk meningkatkan akses dan mutu pelayanan jantung invasif.',
            ],
            [
                'year' => 2028,
                'strategic_program' => 'Penguatan Layanan Kegawatdaruratan dan Bedah Vaskular',
                'service_plan' => 'Pelayanan Trombektomi',
                'target' => 'Tersedianya layanan trombektomi untuk mendukung penanganan kasus bedah vaskular secara cepat and tepat.',
                'policy_direction' => 'Penguatan layanan kegawatdaruratan dan bedah vaskular melalui pengembangan pelayanan trombektomi secara bertahap guna meningkatkan mutu dan kecepatan pelayanan pasien.',
            ],
            [
                'year' => 2028,
                'strategic_program' => 'Peningkatan Kelas dan Kapasitas Rumah Sakit',
                'service_plan' => 'Pengembangan Rumah Sakit ke Tipe B',
                'target' => 'Terpenuhinya persyaratan kelas RS Tipe B (SDM, sarpras, dan layanan)',
                'policy_direction' => 'Penguatan peran RS sebagai rumah sakit rujukan regional',
            ],
            [
                'year' => 2029,
                'strategic_program' => 'Optimalisasi dan Penguatan Layanan Unggulan',
                'service_plan' => 'Optimalisasi seluruh layanan yang telah dikembangkan',
                'target' => 'Berfungsinya layanan unggulan secara optimal dan berkelanjutan',
                'policy_direction' => 'Penjaminan mutu layanan dan keberlanjutan pengembangan',
            ],
        ];

        foreach ($plans as $plan) {
            StrategicServicePlan::create($plan);
        }
    }
}
