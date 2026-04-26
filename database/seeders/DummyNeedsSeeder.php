<?php

namespace Database\Seeders;

use App\Models\ChecklistQuestion;
use App\Models\Indicator;
use App\Models\Need;
use App\Models\NeedChecklistAnswer;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\Sasaran;
use App\Models\StrategicServicePlan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DummyNeedsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = OrganizationalUnit::doesntHave('children')->get();
        if ($units->isEmpty()) {
            return;
        }

        $needTypes = NeedType::all()->keyBy('code');
        $checklistQuestions = ChecklistQuestion::all();
        $sasarans = Sasaran::all();
        $indicators = Indicator::all();
        $kpiIndicators = DB::table('kpi_indicators')->get();
        $servicePlans = StrategicServicePlan::all();

        $itemPool = [
            ['title' => 'Dokter Spesialis Anak', 'type' => 'SDM', 'unit' => 'orang', 'price' => 150000000],
            ['title' => 'Dokter Spesialis Penyakit Dalam', 'type' => 'SDM', 'unit' => 'orang', 'price' => 150000000],
            ['title' => 'Perawat Mahir', 'type' => 'SDM', 'unit' => 'orang', 'price' => 80000000],
            ['title' => 'Tenaga IT Programmer', 'type' => 'SDM', 'unit' => 'orang', 'price' => 100000000],
            ['title' => 'MRI Scanner 1.5T', 'type' => 'ALKES', 'unit' => 'unit', 'price' => 15000000000],
            ['title' => 'CT Scan 64 Slice', 'type' => 'ALKES', 'unit' => 'unit', 'price' => 8000000000],
            ['title' => 'Ventilator Dewasa', 'type' => 'ALKES', 'unit' => 'unit', 'price' => 350000000],
            ['title' => 'Patient Monitor', 'type' => 'ALKES', 'unit' => 'unit', 'price' => 45000000],
            ['title' => 'USG 4 Dimensi', 'type' => 'ALKES', 'unit' => 'unit', 'price' => 800000000],
            ['title' => 'Obat Amoxicillin Syrup', 'type' => 'PERSEDIAAN', 'unit' => 'botol', 'price' => 15000],
            ['title' => 'Obat Paracetamol Tablet', 'type' => 'PERSEDIAAN', 'unit' => 'box', 'price' => 25000],
            ['title' => 'Cairan Infus RL', 'type' => 'PERSEDIAAN', 'unit' => 'kolf', 'price' => 18000],
            ['title' => 'Masker N95', 'type' => 'PERSEDIAAN', 'unit' => 'box', 'price' => 150000],
            ['title' => 'Hand Sanitizer 500ml', 'type' => 'PERSEDIAAN', 'unit' => 'botol', 'price' => 45000],
            ['title' => 'Gedung Rawat Inap VIP', 'type' => 'SARANA', 'unit' => 'gedung', 'price' => 5000000000],
            ['title' => 'Renovasi IGD', 'type' => 'SARANA', 'unit' => 'paket', 'price' => 2500000000],
            ['title' => 'Genset 500 KVA', 'type' => 'SARANA', 'unit' => 'unit', 'price' => 850000000],
            ['title' => 'Ambulance Transport', 'type' => 'SARANA', 'unit' => 'unit', 'price' => 600000000],
            ['title' => 'Sistem Informasi Manajemen RS', 'type' => 'SARANA', 'unit' => 'paket', 'price' => 1200000000],
            ['title' => 'Server Rack 42U', 'type' => 'SARANA', 'unit' => 'unit', 'price' => 15000000],
        ];

        $plan = [
            2024 => 3,
            2025 => 3,
            2026 => 1,
        ];

        foreach ($plan as $year => $numGroups) {
            for ($g = 1; $g <= $numGroups; $g++) {
                $group = NeedGroup::create([
                    'name' => "Usulan $year - Tahap $g",
                    'year' => $year,
                    'description' => "Pengajuan kebutuhan prioritas tahap $g tahun $year",
                    'is_active' => ($year === 2026 || $year === 2025),
                ]);

                if ($checklistQuestions->isNotEmpty()) {
                    $group->checklistQuestions()->sync($checklistQuestions->pluck('id'));
                }

                $numNeeds = rand(20, 30);
                for ($n = 0; $n < $numNeeds; $n++) {
                    $item = $itemPool[array_rand($itemPool)];
                    $type = $needTypes->get($item['type']);
                    if (! $type) {
                        continue;
                    }

                    $unit = $units->random();
                    $volume = rand(1, 50);
                    $priceModifier = rand(90, 110) / 100;
                    $unitPrice = $item['price'] * $priceModifier;

                    $percentage = 0;
                    $status = 'draft';
                    $approvedAt = null;

                    if ($year < 2026) {
                        $percentage = rand(70, 100);
                        $statusOptions = ['approved', 'approved', 'approved', 'rejected', 'draft'];
                        $status = $statusOptions[array_rand($statusOptions)];
                        if ($status === 'approved') {
                            $approvedAt = now()->subMonths(rand(1, 12));
                        }
                    }

                    $need = Need::create([
                        'organizational_unit_id' => $unit->id,
                        'need_type_id' => $type->id,
                        'need_group_id' => $group->id,
                        'year' => $year,
                        'title' => $item['title'].' '.rand(100, 999),
                        'current_condition' => 'Kondisi saat ini kurang memadai',
                        'required_condition' => 'Diperlukan untuk operasional',
                        'volume' => $volume,
                        'unit' => $item['unit'],
                        'unit_price' => $unitPrice,
                        'total_price' => $volume * $unitPrice,
                        'status' => $status,
                        'urgency' => ['low', 'medium', 'high'][rand(0, 2)],
                        'impact' => ['low', 'medium', 'high'][rand(0, 2)],
                        'is_priority' => rand(0, 1) == 1,
                        'checklist_percentage' => $percentage,
                        'approved_by_director_at' => $approvedAt,
                    ]);

                    if ($year < 2026 && $checklistQuestions->isNotEmpty()) {
                        $totalQ = $checklistQuestions->count();
                        $yesCount = round(($percentage / 100) * $totalQ);

                        $shuffledQ = $checklistQuestions->shuffle();

                        foreach ($shuffledQ as $index => $q) {
                            $answer = 'skip';
                            if ($index < $yesCount) {
                                $answer = 'yes';
                            } else {
                                $answer = rand(0, 1) ? 'no' : 'skip';
                            }
                            NeedChecklistAnswer::create([
                                'need_id' => $need->id,
                                'checklist_question_id' => $q->id,
                                'answer' => $answer,
                            ]);
                        }
                    }

                    if ($sasarans->isNotEmpty() && rand(0, 1) == 1) {
                        DB::table('need_sasaran')->insert([
                            'need_id' => $need->id,
                            'sasaran_id' => $sasarans->random()->id,
                        ]);
                    }
                    if ($indicators->isNotEmpty() && rand(0, 1) == 1) {
                        DB::table('need_indicator')->insert([
                            'need_id' => $need->id,
                            'indicator_id' => $indicators->random()->id,
                        ]);
                    }
                    if ($kpiIndicators->isNotEmpty() && rand(0, 1) == 1) {
                        DB::table('kpi_indicator_need')->insert([
                            'need_id' => $need->id,
                            'kpi_indicator_id' => $kpiIndicators->random()->id,
                        ]);
                    }
                    if ($servicePlans->isNotEmpty() && rand(0, 1) == 1) {
                        DB::table('need_strategic_service_plan')->insert([
                            'need_id' => $need->id,
                            'strategic_service_plan_id' => $servicePlans->random()->id,
                        ]);
                    }
                }
            }
        }
    }
}
