<?php

namespace Database\Seeders;

use App\Models\Indicator;
use App\Models\Renstra;
use App\Models\Sasaran;
use App\Models\Tujuan;
use Illuminate\Database\Seeder;

class RenstraRSUDSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $renstra = Renstra::create([
            'name' => 'Renstra RSUD 2025-2030',
            'year_start' => 2025,
            'year_end' => 2030,
            'description' => 'Rencana Strategis RSUD Tahunan 2025-2030',
            'is_active' => true,
        ]);

        // TUJUAN 1: Meningkatkan kualitas pelayanan kesehatan secara berkesinambungan
        $tujuan1 = Tujuan::create([
            'renstra_id' => $renstra->id,
            'name' => 'Meningkatkan kualitas pelayanan kesehatan secara berkesinambungan',
        ]);

        // Indicator langsung bawah Tujuan 1
        $indSakip = Indicator::create([
            'tujuan_id' => $tujuan1->id,
            'name' => 'Nilai SAKIP',
            'baseline' => '50',
        ]);
        $this->createTargets($indSakip, ['60', '60', '60', '60', '60', '60']);

        // SASARANs under Purpose 1
        $sasaranBor = Sasaran::create([
            'tujuan_id' => $tujuan1->id,
            'name' => 'Tercapainya target Bed Occupacy Rate (BOR)',
        ]);
        $indBor = Indicator::create([
            'sasaran_id' => $sasaranBor->id,
            'name' => 'Angka BOR',
            'baseline' => '44.70%',
        ]);
        $this->createTargets($indBor, ['50%', '51.50%', '53%', '55%', '57%', '60%']);

        $sasaranParipurna = Sasaran::create([
            'tujuan_id' => $tujuan1->id,
            'name' => 'Pelayanan Pasien Secara Paripurna',
        ]);
        $indParipurna = Indicator::create([
            'sasaran_id' => $sasaranParipurna->id,
            'name' => 'Akreditasi Paripurna',
            'baseline' => 'Paripurna',
        ]);
        $this->createTargets($indParipurna, ['Paripurna', 'Paripurna', 'Paripurna', 'Paripurna', 'Paripurna', 'Paripurna']);

        $sasaranAspak = Sasaran::create([
            'tujuan_id' => $tujuan1->id,
            'name' => 'Terpenuhinya ketersediaan sarana dan prasarana yang terstandarisasi',
        ]);
        $indAspak = Indicator::create([
            'sasaran_id' => $sasaranAspak->id,
            'name' => 'Nilai ASPAK',
            'baseline' => '65',
        ]);
        $this->createTargets($indAspak, ['68', '75', '75', '75', '75', '75']);

        $sasaranObat = Sasaran::create([
            'tujuan_id' => $tujuan1->id,
            'name' => 'Terpenuhinya obat-obatan dan Bahan Medis Habis Pakai sesuai formularium rumah sakit',
        ]);
        $indObat = Indicator::create([
            'sasaran_id' => $sasaranObat->id,
            'name' => 'Formalarium Rumah Sakit',
            'baseline' => '100%',
        ]);
        $this->createTargets($indObat, ['100%', '100%', '100%', '100%', '100%', '100%']);

        $sasaranKepuasan = Sasaran::create([
            'tujuan_id' => $tujuan1->id,
            'name' => 'Meningkatnya kepuasan pasien',
        ]);
        $indKepuasan = Indicator::create([
            'sasaran_id' => $sasaranKepuasan->id,
            'name' => 'Indeks Kepuasan Masyarakat',
            'baseline' => '86',
        ]);
        $this->createTargets($indKepuasan, ['88', '90', '92', '94', '96', '98']);

        $sasaranMou = Sasaran::create([
            'tujuan_id' => $tujuan1->id,
            'name' => 'Meningkatnya kerjasama dengan stakeholder terkait',
        ]);
        $indMou = Indicator::create([
            'sasaran_id' => $sasaranMou->id,
            'name' => 'Jumlah MOU',
            'baseline' => '5 MOU',
        ]);
        $this->createTargets($indMou, ['5 MOU', '5 MOU', '5 MOU', '5 MOU', '5 MOU', '5 MOU']);

        // TUJUAN 2: Mewujudkan sumber manusia kesehatan dengan kompetensi sesuai standar
        $tujuan2 = Tujuan::create([
            'renstra_id' => $renstra->id,
            'name' => 'Mewujudkan sumber manusia kesehatan dengan kompetensi sesuai standar',
        ]);

        $indStr = Indicator::create([
            'tujuan_id' => $tujuan2->id,
            'name' => 'Persentase SDM Kesehatan yang memiliki STR dan SIP yang masih berlaku',
            'baseline' => '100%',
        ]);
        $this->createTargets($indStr, ['100%', '100%', '100%', '100%', '100%', '100%']);

        $sasaranSdm = Sasaran::create([
            'tujuan_id' => $tujuan2->id,
            'name' => 'Terpenuhinya Sumber Daya Manusia Sesuai Kebutuhan dan standarisasi rumah sakit',
        ]);
        $indSdm = Indicator::create([
            'sasaran_id' => $sasaranSdm->id,
            'name' => 'Persentase SDM Kesehatan yang tersedia dengan yang dibutuhkan sesuai standar rumah sakit',
            'baseline' => '69%',
        ]);
        $this->createTargets($indSdm, ['76%', '78%', '82%', '91%', '96%', '100%']);

        $sasaranKompetensi = Sasaran::create([
            'tujuan_id' => $tujuan2->id,
            'name' => 'Peningkatan Kompetensi, Keahlian dan Keterampilan Sumber Daya Manusia secara berkelanjutan',
        ]);
        $indKompetensi = Indicator::create([
            'sasaran_id' => $sasaranKompetensi->id,
            'name' => 'Persentase SDM Kesehatan yang memiliki sertifikat sesuai kompetensi',
            'baseline' => '38%',
        ]);
        $this->createTargets($indKompetensi, ['42%', '49%', '67%', '83%', '96%', '100%']);
    }

    /**
     * Create targets for an indicator.
     */
    private function createTargets(Indicator $indicator, array $targets): void
    {
        $year = 2025;
        foreach ($targets as $targetValue) {
            $indicator->targets()->create([
                'year' => $year,
                'target' => $targetValue,
            ]);
            $year++;
        }
    }
}
