<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Actions\Need\ChecklistAssessmentEngine;
use App\Actions\Need\NeedLockLifecycle;
use App\Actions\Need\NeedProposalEngine;
use App\Actions\Need\NeedProposalPayload;
use App\Models\ChecklistQuestion;
use App\Models\FundingSource;
use App\Models\Indicator;
use App\Models\KpiIndicator;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\Sasaran;
use App\Models\StrategicServicePlan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Simulate real manual data entry through the same application engines.
 *
 * Flow per need (mirrors the UI procedure):
 *  1. Staff submits a draft inside an open NeedGroup (NeedProposalEngine::submit).
 *  2. KAK detail + funding sources + strategic alignments saved with the proposal.
 *  3. Supporting files uploaded as general / technical specification attachments.
 *  4. Checklist answered per the group's questions (ChecklistAssessmentEngine).
 *  5. Planner sets the administrative status (draft / approved / rejected).
 *  6. Director reviews (NeedLockLifecycle): approval freezes the need,
 *     rejection returns notes and reopens it only while the group window is open.
 */
class SimulatedNeedsSeeder extends Seeder
{
    private const string GROUP_FINAL = 'Usulan RKA 2026 - Tahap 1 (Simulasi Final)';

    private const string GROUP_RUNNING = 'Usulan RKA 2026 - Tahap 2 (Simulasi Berjalan)';

    public function run(): void
    {
        $engine = new NeedProposalEngine;
        $checklist = new ChecklistAssessmentEngine;
        $lifecycle = new NeedLockLifecycle;

        $baseline = $this->requireBaseline();

        foreach ($this->groupPlans() as $plan) {
            $group = $this->resetGroup($plan);
            $group->checklistQuestions()->sync($this->questionPivot($baseline['questions']));
            $submittedAt = Carbon::parse($plan['window_start'])->addDays(2);

            foreach ($plan['items'] as $index => $item) {
                $submitted = $submittedAt->copy()->addDays((int) floor($index / 3))->addHours($index % 3 + 1);
                $reviewed = $submitted->copy()->addDays($plan['review_lag_days']);

                $need = $this->submitProposal($engine, $baseline, $group, $item, $submitted);
                $this->backdate($need, $submitted, $submitted);
                $this->answerChecklist($checklist, $group, $need, $item['outcome'], $submitted);
                $this->applyPlannerStatus($need, $item, $reviewed);
                $this->applyDirectorReview($lifecycle, $baseline, $group, $need, $item, $reviewed);

                $need->refresh();
                $this->backdate($need, $submitted, $reviewed);
            }

            $group->update(['need_count' => $group->needs()->count()]);
        }
    }

    /**
     * @return array{questions: Collection<int, ChecklistQuestion>, types: Collection<string, NeedType>, units: Collection<int, OrganizationalUnit>, fundings: Collection<int, FundingSource>, sasarans: Collection<int, Sasaran>, kpi: Collection<int, KpiIndicator>, plans: Collection<int, StrategicServicePlan>, director: User, planner: User}
     */
    private function requireBaseline(): array
    {
        $questions = ChecklistQuestion::query()->where('is_active', true)->orderBy('order_column')->get();
        $types = NeedType::query()->where('is_active', true)->get()->keyBy('code');
        $units = OrganizationalUnit::query()->whereDoesntHave('children')->get();
        $fundings = FundingSource::query()->get();
        $sasarans = Sasaran::query()->with('indicators')->get()->filter(fn (Sasaran $s) => $s->indicators->isNotEmpty())->values();
        $director = User::query()->whereHas('roles', fn ($q) => $q->where('name', 'director'))->first();
        $planner = User::query()->whereHas('roles', fn ($q) => $q->where('name', 'planner'))->first();

        foreach ([
            'checklist questions' => $questions->isNotEmpty(),
            'need types (SDM/ALKES/PERSEDIAAN/SARANA)' => $types->has(['SDM', 'ALKES', 'PERSEDIAAN', 'SARANA']),
            'leaf organizational units' => $units->isNotEmpty(),
            'funding sources' => $fundings->isNotEmpty(),
            'sasaran rows with indicators' => $sasarans->isNotEmpty(),
            'director user' => $director !== null,
            'planner user' => $planner !== null,
        ] as $label => $ok) {
            if (! $ok) {
                throw new RuntimeException("SimulatedNeedsSeeder needs seeded {$label} first (run DatabaseSeeder baseline).");
            }
        }

        return [
            'questions' => $questions,
            'types' => $types,
            'units' => $units,
            'fundings' => $fundings,
            'sasarans' => $sasarans,
            'kpi' => KpiIndicator::query()->limit(20)->get(),
            'plans' => StrategicServicePlan::query()->limit(20)->get(),
            'director' => $director,
            'planner' => $planner,
        ];
    }

    /**
     * @return array<int, array{name: string, year: int, description: string, window_start: string, window_end: string, review_lag_days: int, items: array<int, array<string, mixed>>}>
     */
    private function groupPlans(): array
    {
        return [
            [
                'name' => self::GROUP_FINAL,
                'year' => 2026,
                'description' => 'Simulasi pengajuan tahap 1 yang sudah melewati masa penilaian: 7 disetujui direktur, 4 ditolak, 1 draft tertinggal jendela.',
                'window_start' => Carbon::now()->subDays(60)->toDateTimeString(),
                'window_end' => Carbon::now()->subDays(30)->toDateTimeString(),
                'review_lag_days' => 5,
                'items' => [
                    $this->item('Pengadaan Ventilator ICU 5 Mode', 'ALKES', 'unit', 4, 385000000, 'high', 'high', 'accepted', 'Disetujui. Selaras dengan prioritas penguatan layanan kritikal tahun berjalan.'),
                    $this->item('Pengadaan Patient Monitor 12 Inci', 'ALKES', 'unit', 10, 48000000, 'high', 'high', 'accepted', 'Disetujui. Kelengkapan monitor ruang rawat intensif dan IGD.'),
                    $this->item('Rekrutmen Dokter Spesialis Anak', 'SDM', 'orang', 2, 180000000, 'high', 'high', 'accepted', 'Disetujui. Pemenuhan standar ketenagaan pelayanan anak.'),
                    $this->item('Pengadaan Amoxicillin Sirup 60ml', 'PERSEDIAAN', 'box', 500, 27500, 'high', 'medium', 'accepted', 'Disetujui. Stok antibiotik anak di bawah ambang minimum.'),
                    $this->item('Renovasi Ruang Instalasi Gawat Darurat', 'SARANA', 'paket', 1, 2500000000, 'high', 'high', 'accepted', 'Disetujui bertahap sesuai ketersediaan pagu DAK.'),
                    $this->item('Pengadaan Genset 500 KVA', 'SARANA', 'unit', 1, 875000000, 'high', 'high', 'accepted', 'Disetujui. Cadangan daya kritis wajib tersedia sebelum musim hujan.'),
                    $this->item('Rekrutmen Perawat Mahir ICU', 'SDM', 'orang', 6, 84000000, 'high', 'medium', 'accepted', 'Disetujui. Rasio perawat-pasien ICU belum memenuhi standar.'),
                    $this->item('Pengadaan MRI 3 Tesla', 'ALKES', 'unit', 1, 28000000000, 'medium', 'low', 'rejected', 'Ditolak. Nilai pagu jauh melebihi ketersediaan anggaran; ajukan kembali melalui skema PHLN/DAK dengan kajian investasi.'),
                    $this->item('Pembangunan Gedung Parkir 4 Lantai', 'SARANA', 'paket', 1, 12000000000, 'medium', 'low', 'rejected', 'Ditolak. Bukan prioritas layanan langsung; usulkan kembali setelah kebutuhan medik terpenuhi.'),
                    $this->item('Pengadaan Ambulance Gawat Darurat 4x4', 'SARANA', 'unit', 2, 650000000, 'medium', 'medium', 'rejected', 'Ditolak. Tumpang tindih dengan usulan pengadaan via DAK tahun yang sama.'),
                    $this->item('Pengadaan Server dan SIMRS Terpadu', 'SARANA', 'paket', 1, 1350000000, 'medium', 'medium', 'rejected', 'Ditolak. Dokumen KAK dan spesifikasi teknis belum lengkap; lengkapi lalu ajukan pada tahap berikut.'),
                    $this->item('Pengadaan USG 4 Dimensi Kandungan', 'ALKES', 'unit', 1, 825000000, 'medium', 'high', 'draft', null),
                ],
            ],
            [
                'name' => self::GROUP_RUNNING,
                'year' => 2026,
                'description' => 'Simulasi pengajuan tahap 2 yang masih berjalan: 3 disetujui, 3 ditolak dan dapat direvisi, 4 draft menunggu kelengkapan.',
                'window_start' => Carbon::now()->subDays(5)->toDateTimeString(),
                'window_end' => Carbon::now()->addDays(20)->toDateTimeString(),
                'review_lag_days' => 2,
                'items' => [
                    $this->item('Pengadaan Cairan Infus Ringer Laktat', 'PERSEDIAAN', 'box', 1200, 210000, 'high', 'high', 'accepted', 'Disetujui. Kebutuhan rutin layanan dengan stok kritis.'),
                    $this->item('Rekrutmen Tenaga IT Programmer SIMRS', 'SDM', 'orang', 2, 110000000, 'high', 'high', 'accepted', 'Disetujui. Penguatan tim pengembang sistem informasi rumah sakit.'),
                    $this->item('Pengadaan Masker N95 Medis', 'PERSEDIAAN', 'box', 800, 165000, 'high', 'high', 'accepted', 'Disetujui. Cadangan APD pengendalian infeksi.'),
                    $this->item('Pengadaan CT Scan 64 Slice', 'ALKES', 'unit', 1, 8500000000, 'medium', 'high', 'rejected', 'Belum disetujui. Mohan dilengkapi kajian utilisasi dan beban operasional sebelum diajukan ulang.'),
                    $this->item('Pengadaan Paracetamol Tablet 500mg', 'PERSEDIAAN', 'box', 3000, 28000, 'low', 'low', 'rejected', 'Belum disetujui. Stok gudang farmasi masih mencukupi 8 bulan; ajukan saat mendekati titik pesan ulang.'),
                    $this->item('Pengadaan Hand Sanitizer 500ml', 'PERSEDIAAN', 'buah', 5000, 48000, 'low', 'medium', 'rejected', 'Belum disetujui. Satukan dengan paket pengadaan bahan kebersihan triwulan berikutnya.'),
                    $this->item('Rekrutmen Dokter Spesialis Penyakit Dalam', 'SDM', 'orang', 1, 180000000, 'medium', 'medium', 'draft', null),
                    $this->item('Perbaikan Atap Bangsal Rawat Inap', 'SARANA', 'paket', 1, 450000000, 'medium', 'medium', 'draft', null),
                    $this->item('Pengadaan Tandu Emergency Lipat', 'SARANA', 'buah', 20, 4500000, 'medium', 'low', 'draft', null),
                    $this->item('Pengadaan Kursi Roda Standar', 'SARANA', 'buah', 25, 2800000, 'low', 'low', 'draft', null),
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function item(string $title, string $type, string $unit, int|float $volume, int|float $unitPrice, string $urgency, string $impact, string $outcome, ?string $reviewNote): array
    {
        return [
            'title' => $title,
            'type' => $type,
            'unit' => $unit,
            'volume' => $volume,
            'unit_price' => $unitPrice,
            'urgency' => $urgency,
            'impact' => $impact,
            'outcome' => $outcome,
            'review_note' => $reviewNote,
        ];
    }

    private function resetGroup(array $plan): NeedGroup
    {
        $disk = (string) config('filesystems.attachments_disk', config('filesystems.default', 'local'));

        $group = NeedGroup::query()->where('name', $plan['name'])->first();
        if ($group === null) {
            return NeedGroup::create([
                'name' => $plan['name'],
                'description' => $plan['description'],
                'year' => $plan['year'],
                'is_active' => true,
                'submission_start_at' => $plan['window_start'],
                'submission_end_at' => $plan['window_end'],
            ]);
        }

        foreach ($group->needs()->withTrashed()->get() as $old) {
            Storage::disk($disk)->deleteDirectory("needs/{$old->id}");
            if (! $old->trashed()) {
                $old->delete();
            }
            $old->forceDelete();
        }

        $group->update([
            'description' => $plan['description'],
            'year' => $plan['year'],
            'is_active' => true,
            'submission_start_at' => $plan['window_start'],
            'submission_end_at' => $plan['window_end'],
        ]);

        return $group->refresh();
    }

    /**
     * @param  Collection<int, ChecklistQuestion>  $questions
     */
    private function questionPivot($questions): array
    {
        $pivot = [];
        foreach ($questions as $index => $question) {
            $pivot[$question->id] = [
                'order_column' => $index + 1,
                'is_required' => true,
                'is_active' => true,
            ];
        }

        return $pivot;
    }

    private function submitProposal(NeedProposalEngine $engine, array $baseline, NeedGroup $group, array $item, Carbon $submitted): Need
    {
        /** @var NeedType $type */
        $type = $baseline['types'][$item['type']];
        /** @var OrganizationalUnit $unit */
        $unit = $baseline['units']->random();
        /** @var Sasaran $sasaran */
        $sasaran = $baseline['sasarans']->random();
        /** @var Indicator $indicator */
        $indicator = $sasaran->indicators->random();

        $total = round(((float) $item['volume']) * ((float) $item['unit_price']), 2);
        $fundingNames = $this->fundingFor($baseline, $item['type']);

        $payload = NeedProposalPayload::fromArray(
            data: [
                'need_group_id' => $group->id,
                'organizational_unit_id' => $unit->id,
                'need_type_id' => $type->id,
                'year' => $group->year,
                'title' => $item['title'],
                'description' => $this->descriptionFor($item, $unit),
                'current_condition' => $this->currentConditionFor($item),
                'required_condition' => $this->requiredConditionFor($item),
                'volume' => $item['volume'],
                'unit' => $item['unit'],
                'unit_price' => $item['unit_price'],
                'total_price' => $total,
                'urgency' => $item['urgency'],
                'impact' => $item['impact'],
                'status' => Need::STATUS_DRAFT,
                'sasaran_ids' => [$sasaran->id],
                'indicator_ids' => [$indicator->id],
                'kpi_indicator_ids' => $baseline['kpi']->isNotEmpty() ? [$baseline['kpi']->random()->id] : null,
                'strategic_service_plan_ids' => $baseline['plans']->isNotEmpty() ? [$baseline['plans']->random()->id] : null,
                'detail' => [
                    'background' => $this->backgroundFor($item, $unit),
                    'purpose_and_objectives' => $this->purposeFor($item),
                    'target_objective' => $this->targetFor($item),
                    'kldi' => 'UKPBJ KAB. DONGGALA',
                    'satker_skpd' => 'RSUD KABELOTA DONGGALA',
                    'kpa_id' => $this->kpaFor($baseline, $unit),
                    'funding_source_ids' => $fundingNames,
                    'estimated_cost' => $this->estimatedCost($total),
                    'implementation_period' => 'Triwulan III Tahun Anggaran '.$group->year.' (Juli-September)',
                    'expert_or_skilled_personnel' => $this->expertFor($item['type']),
                    'technical_specifications' => $this->specsFor($item),
                    'training' => $this->trainingFor($item['type']),
                ],
            ],
            attachments: $this->uploadedFiles($item['title'], $item['type'], false),
            attachmentNames: $this->attachmentNames($item['title'], false),
            technicalSpecificationAttachments: $this->uploadedFiles($item['title'], $item['type'], true),
            technicalSpecificationAttachmentNames: $this->attachmentNames($item['title'], true),
        );

        return $engine->submit($payload);
    }

    private function answerChecklist(ChecklistAssessmentEngine $checklist, NeedGroup $group, Need $need, string $outcome, Carbon $answeredAt): void
    {
        $questionIds = $group->checklistQuestions()->pluck('checklist_questions.id')->all();
        $total = count($questionIds);

        $answers = match ($outcome) {
            'accepted' => $this->pattern($questionIds, (int) ceil($total * 0.9), 'yes'),
            'rejected' => $this->pattern($questionIds, (int) floor($total * 0.35), 'yes'),
            default => $this->draftPattern($questionIds),
        };

        if ($answers === []) {
            return;
        }

        $checklist->evaluate($need, $answers);

        $need->checklistAnswers()->update(['created_at' => $answeredAt, 'updated_at' => $answeredAt]);
    }

    /**
     * @param  array<int, int>  $questionIds
     * @return array<int, array{checklist_question_id: int, answer: string, notes: ?string}>
     */
    private function pattern(array $questionIds, int $yesCount, string $fallback): array
    {
        $answers = [];
        foreach (array_values($questionIds) as $index => $questionId) {
            $isYes = $index < $yesCount;
            $answers[] = [
                'checklist_question_id' => $questionId,
                'answer' => $isYes ? 'yes' : 'no',
                'notes' => $isYes ? null : 'Belum memenuhi kriteria, perlu dilengkapi.',
            ];
        }

        return $answers;
    }

    /**
     * @param  array<int, int>  $questionIds
     * @return array<int, array{checklist_question_id: int, answer: string, notes: ?string}>
     */
    private function draftPattern(array $questionIds): array
    {
        $answers = [];
        foreach (array_values(array_slice($questionIds, 0, 3)) as $index => $questionId) {
            $answers[] = [
                'checklist_question_id' => $questionId,
                'answer' => $index < 2 ? 'yes' : 'no',
                'notes' => null,
            ];
        }

        return $answers;
    }

    private function applyPlannerStatus(Need $need, array $item, Carbon $reviewed): void
    {
        $status = match ($item['outcome']) {
            'accepted' => Need::STATUS_APPROVED,
            'rejected' => Need::STATUS_REJECTED,
            default => Need::STATUS_DRAFT,
        };

        $need->update(['status' => $status]);
        $need->updateQuietly(['updated_at' => $reviewed]);
    }

    private function applyDirectorReview(NeedLockLifecycle $lifecycle, array $baseline, NeedGroup $group, Need $need, array $item, Carbon $reviewed): void
    {
        if ($item['outcome'] === 'draft') {
            return;
        }

        if ($item['outcome'] === 'accepted') {
            $lifecycle->approveByDirector($need, $item['review_note'], $baseline['director']);
            $need->updateQuietly([
                'approved_by_director_at' => $reviewed,
                'locked_at' => $reviewed,
                'updated_at' => $reviewed,
            ]);

            return;
        }

        $lifecycle->rejectDirectorApproval($need, $item['review_note'], $group->isOpenForSubmission());
        $need->updateQuietly(['updated_at' => $reviewed]);
    }

    private function backdate(Need $need, Carbon $created, Carbon $updated): void
    {
        $need->updateQuietly(['created_at' => $created, 'updated_at' => $updated]);
        $need->detail()->update(['created_at' => $created, 'updated_at' => $updated]);
        $need->attachments()->update(['created_at' => $created, 'updated_at' => $created]);
    }

    /**
     * @return array<int, string>
     */
    private function fundingFor(array $baseline, string $type): array
    {
        $names = $baseline['fundings']->pluck('name')->all();

        return match ($type) {
            'ALKES' => $this->pick($names, ['DAK', 'BLUD']),
            'SARANA' => $this->pick($names, ['DAK', 'APBD']),
            'SDM' => $this->pick($names, ['BLUD', 'APBD']),
            default => $this->pick($names, ['APBD', 'BLUD']),
        };
    }

    /**
     * @param  array<int, string>  $names
     * @param  array<int, string>  $preferred
     * @return array<int, string>
     */
    private function pick(array $names, array $preferred): array
    {
        $picked = array_values(array_intersect($preferred, $names));

        return $picked === [] ? array_slice($names, 0, 1) : array_slice($picked, 0, 2);
    }

    private function kpaFor(array $baseline, OrganizationalUnit $unit): ?int
    {
        $head = User::query()->where('organizational_unit_id', $unit->id)->first();

        return $head?->id ?? $baseline['planner']->id;
    }

    private function descriptionFor(array $item, OrganizationalUnit $unit): string
    {
        return "Usulan {$item['title']} dari {$unit->name} untuk pemenuhan kebutuhan {$this->typeLabel($item['type'])} tahun anggaran berjalan sebanyak {$item['volume']} {$item['unit']}.";
    }

    private function currentConditionFor(array $item): string
    {
        return match ($item['type']) {
            'SDM' => "Kekurangan personel {$item['title']} sehingga beban kerja existing melebihi kapasitas dan mengganggu mutu layanan.",
            'ALKES' => "Peralatan {$item['title']} yang tersedia tidak mencukupi kebutuhan layanan dan sebagian sudah melewati usia teknis.",
            'PERSEDIAAN' => "Stok {$item['title']} di gudang berada di bawah ambang minimum dan berisiko mengganggu kontinuitas layanan.",
            default => "Fasilitas {$item['title']} eksisting tidak layak dan menghambat operasional pelayanan.",
        };
    }

    private function requiredConditionFor(array $item): string
    {
        return "Diperlukan {$item['title']} sebanyak {$item['volume']} {$item['unit']} agar pelayanan berjalan aman, layak, dan sesuai standar.";
    }

    private function backgroundFor(array $item, OrganizationalUnit $unit): string
    {
        return "Latar belakang: {$unit->name} mengusulkan {$item['title']} karena kondisi eksisting tidak lagi memadai. {$this->currentConditionFor($item)} Pengadaan ini menjadi bagian dari pemenuhan standar pelayanan rumah sakit.";
    }

    private function purposeFor(array $item): string
    {
        return "Maksud: memenuhi kebutuhan {$item['title']}. Tujuan: menjamin ketersediaan {$item['volume']} {$item['unit']} yang layak pakai untuk mendukung kelancaran pelayanan kepada pasien.";
    }

    private function targetFor(array $item): string
    {
        return "Target capaian: 100% kebutuhan {$item['title']} terpenuhi dan termanfaatkan pada triwulan berjalan dengan serapan anggaran sesuai pagu.";
    }

    private function expertFor(string $type): string
    {
        return match ($type) {
            'ALKES' => 'Tenaga elektromedis bersertifikat dan operator terlatih dari unit terkait.',
            'SDM' => 'Tim seleksi kepegawaian bersama bidang terkait sesuai formasi yang ditetapkan.',
            'PERSEDIAAN' => 'Tenaga kefarmasian dan logistik untuk penerimaan, penyimpanan, dan distribusi.',
            default => 'Tim teknis sarana-prasarana dan pengawas pekerjaan bersertifikat.',
        };
    }

    private function specsFor(array $item): string
    {
        return "Spesifikasi {$item['title']}: volume {$item['volume']} {$item['unit']}, standar mutu sesuai ketentuan yang berlaku, garansi dan layanan purna jual dari penyedia.";
    }

    private function trainingFor(string $type): string
    {
        return match ($type) {
            'ALKES' => 'Pelatihan pengoperasian dan pemeliharaan alat bagi operator dan teknisi selama masa garansi.',
            'SDM' => 'Orientasi dan pembekalan awal sesuai standar kompetensi jabatan.',
            'PERSEDIAAN' => 'Sosialisasi penyimpanan dan penanganan bahan kepada petugas gudang.',
            default => 'Serah terima pekerjaan disertai manual perawatan dan pelatihan singkat bagi petugas.',
        };
    }

    private function typeLabel(string $type): string
    {
        return match ($type) {
            'SDM' => 'sumber daya manusia',
            'ALKES' => 'alat kesehatan',
            'PERSEDIAAN' => 'persediaan/barang habis pakai',
            default => 'sarana-prasarana',
        };
    }

    /**
     * @return array<int, UploadedFile>
     */
    private function uploadedFiles(string $title, string $type, bool $technical): array
    {
        if ($technical && ! in_array($type, ['ALKES', 'SARANA'], true)) {
            return [];
        }

        $name = $technical ? "Spesifikasi Teknis - {$title}.pdf" : "KAK - {$title}.pdf";
        $path = tempnam(sys_get_temp_dir(), 'seed-need-');
        if ($path === false) {
            throw new RuntimeException('Cannot create temp file for seeded attachment.');
        }
        file_put_contents($path, "%PDF-1.4\n%Simulasi dokumen {$title}\n%%EOF\n");

        return [new UploadedFile($path, $name, 'application/pdf', null, true)];
    }

    /**
     * @return array<int, string>
     */
    private function attachmentNames(string $title, bool $technical): array
    {
        if ($technical) {
            return ["Spesifikasi Teknis - {$title}"];
        }

        return ["KAK - {$title}"];
    }

    private function estimatedCost(float $total): string
    {
        $formatted = 'Rp '.number_format($total, 0, ',', '.');

        return "{$formatted} (".$this->ucfirst($this->terbilang($total).' rupiah').')';
    }

    private function ucfirst(string $value): string
    {
        return mb_strtoupper(mb_substr($value, 0, 1)).mb_substr($value, 1);
    }

    private function terbilang(float $number): string
    {
        $number = abs($number);
        $words = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
        $temp = '';

        if ($number < 12) {
            $temp = ' '.$words[(int) $number];
        } elseif ($number < 20) {
            $temp = $this->terbilang($number - 10).' belas';
        } elseif ($number < 100) {
            $temp = $this->terbilang($number / 10).' puluh'.$this->terbilang(fmod($number, 10));
        } elseif ($number < 200) {
            $temp = ' seratus'.$this->terbilang($number - 100);
        } elseif ($number < 1000) {
            $temp = $this->terbilang($number / 100).' ratus'.$this->terbilang(fmod($number, 100));
        } elseif ($number < 2000) {
            $temp = ' seribu'.$this->terbilang($number - 1000);
        } elseif ($number < 1000000) {
            $temp = $this->terbilang($number / 1000).' ribu'.$this->terbilang(fmod($number, 1000));
        } elseif ($number < 1000000000) {
            $temp = $this->terbilang($number / 1000000).' juta'.$this->terbilang(fmod($number, 1000000));
        } elseif ($number < 1000000000000) {
            $temp = $this->terbilang($number / 1000000000).' miliar'.$this->terbilang(fmod($number, 1000000000));
        }

        return trim($temp);
    }
}
