<?php

use App\Actions\Need\NeedLockLifecycle;
use App\Actions\Need\NeedProposalEngine;
use App\DTOs\Need\NeedProposalPayload;
use App\Models\Indicator;
use App\Models\KpiIndicator;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\PlanningActivityIndicator;
use App\Models\PlanningActivityVersion;
use App\Models\Sasaran;
use App\Models\StrategicServicePlan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('submits a new proposal with alignments, dynamic funding sources, and derived priority', function () {
    $group = NeedGroup::factory()->create();
    $unit = OrganizationalUnit::factory()->create();
    $type = NeedType::factory()->create();

    $sasaran = Sasaran::factory()->create();
    $indicator = Indicator::factory()->create();
    $kpi = KpiIndicator::factory()->create();
    $strategicPlan = StrategicServicePlan::factory()->create();
    $activity = PlanningActivityVersion::factory()->create();
    $activityIndicator = PlanningActivityIndicator::query()->create([
        'planning_activity_version_id' => $activity->id,
        'name' => 'Indikator Kegiatan A',
    ]);

    $engine = app(NeedProposalEngine::class);

    $payload = NeedProposalPayload::fromArray([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $type->id,
        'title' => 'Pengadaan Server Baru',
        'year' => 2026,
        'volume' => 10,
        'unit' => 'unit',
        'unit_price' => 15000000,
        'total_price' => 150000000,
        'urgency' => 'high',
        'impact' => 'high',
        'sasaran_ids' => [$sasaran->id],
        'indicator_ids' => [$indicator->id],
        'kpi_indicator_ids' => [$kpi->id],
        'strategic_service_plan_ids' => [$strategicPlan->id],
        'planning_activity_version_ids' => [$activity->id],
        'planning_activity_indicator_ids' => [$activityIndicator->id],
        'detail' => [
            'budget_needed' => 150000000,
            'funding_source_ids' => ['Hibah Luar Negeri 2026'],
        ],
    ]);

    $need = $engine->submit($payload);

    expect($need->exists)->toBeTrue()
        ->and($need->title)->toBe('Pengadaan Server Baru')
        ->and($need->is_priority)->toBeTrue()
        ->and($need->sasarans)->toHaveCount(1)
        ->and($need->indicators)->toHaveCount(1)
        ->and($need->kpiIndicators)->toHaveCount(1)
        ->and($need->strategicServicePlans)->toHaveCount(1)
        ->and($need->planningActivityVersions)->toHaveCount(1)
        ->and($need->planningActivityIndicators)->toHaveCount(1)
        ->and($need->detail)->not->toBeNull()
        ->and($need->detail->fundingSources)->toHaveCount(1)
        ->and($need->detail->fundingSources->first()->name)->toBe('Hibah Luar Negeri 2026');
});

it('derives is_priority as false when urgency or impact is not high', function () {
    $group = NeedGroup::factory()->create();
    $unit = OrganizationalUnit::factory()->create();
    $type = NeedType::factory()->create();
    $engine = app(NeedProposalEngine::class);

    $payload = NeedProposalPayload::fromArray([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $type->id,
        'title' => 'Pengadaan Kursi Kerja',
        'year' => 2026,
        'volume' => 5,
        'unit' => 'set',
        'unit_price' => 1000000,
        'total_price' => 5000000,
        'urgency' => 'low',
        'impact' => 'high',
    ]);

    $need = $engine->submit($payload);

    expect($need->is_priority)->toBeFalse();
});

it('submits a proposal with categorized attachments using configured attachments disk', function () {
    Config::set('filesystems.attachments_disk', 'local');
    Storage::fake('local');

    $group = NeedGroup::factory()->create();
    $unit = OrganizationalUnit::factory()->create();
    $type = NeedType::factory()->create();
    $engine = app(NeedProposalEngine::class);

    $generalFile = UploadedFile::fake()->create('dokumen_kak.pdf', 500, 'application/pdf');
    $techFile = UploadedFile::fake()->create('spesifikasi_teknis.docx', 800, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    $payload = NeedProposalPayload::fromArray(
        data: [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $unit->id,
            'need_type_id' => $type->id,
            'title' => 'Pengadaan Laptop',
            'year' => 2026,
            'volume' => 20,
            'unit' => 'unit',
            'unit_price' => 10000000,
            'total_price' => 200000000,
            'urgency' => 'medium',
            'impact' => 'medium',
        ],
        attachments: [$generalFile],
        attachmentNames: ['Kerangka Acuan Kerja'],
        technicalSpecificationAttachments: [$techFile],
        technicalSpecificationAttachmentNames: ['Rincian Spek Laptop']
    );

    $need = $engine->submit($payload);

    expect($need->attachments)->toHaveCount(2);

    $general = $need->attachments->firstWhere('category', 'general');
    $tech = $need->attachments->firstWhere('category', 'technical_specifications');

    expect($general)->not->toBeNull()
        ->and($general->display_name)->toBe('Kerangka Acuan Kerja')
        ->and(Storage::disk('local')->exists($general->file_path))->toBeTrue()
        ->and($tech)->not->toBeNull()
        ->and($tech->display_name)->toBe('Rincian Spek Laptop')
        ->and(str_contains($tech->file_path, 'technical_specifications'))->toBeTrue()
        ->and(Storage::disk('local')->exists($tech->file_path))->toBeTrue();
});

it('updates an existing proposal with partial alignments without clearing untouched relations', function () {
    $need = Need::factory()->create(['urgency' => 'low', 'impact' => 'low']);
    $sasaran1 = Sasaran::factory()->create();
    $sasaran2 = Sasaran::factory()->create();
    $indicator = Indicator::factory()->create();

    $need->sasarans()->attach([$sasaran1->id]);
    $need->indicators()->attach([$indicator->id]);

    $engine = app(NeedProposalEngine::class);

    // Update only sasarans, indicator_ids omitted
    $payload = NeedProposalPayload::fromArray([
        'title' => 'Updated Title',
        'sasaran_ids' => [$sasaran2->id],
    ]);

    $updated = $engine->update($need, $payload);

    expect($updated->title)->toBe('Updated Title')
        ->and($updated->sasarans->pluck('id')->all())->toEqual([$sasaran2->id])
        ->and($updated->indicators->pluck('id')->all())->toEqual([$indicator->id]);
});

it('updates an existing proposal and purges deleted attachments from storage and database', function () {
    Config::set('filesystems.attachments_disk', 'local');
    Storage::fake('local');

    $need = Need::factory()->create();
    $engine = app(NeedProposalEngine::class);

    $file1 = UploadedFile::fake()->create('file1.pdf', 100);
    $file2 = UploadedFile::fake()->create('file2.pdf', 100);

    $att1 = $engine->addAttachment($need, ['file' => $file1, 'display_name' => 'File 1']);
    $att2 = $engine->addAttachment($need, ['file' => $file2, 'display_name' => 'File 2']);

    expect(Storage::disk('local')->exists($att1->file_path))->toBeTrue()
        ->and(Storage::disk('local')->exists($att2->file_path))->toBeTrue();

    // Update with deleted_attachment_ids containing $att1->id
    $payload = NeedProposalPayload::fromArray([
        'title' => 'Updated Need',
        'deleted_attachment_ids' => [$att1->id],
    ]);

    $engine->update($need, $payload);

    expect(Storage::disk('local')->exists($att1->file_path))->toBeFalse()
        ->and(Storage::disk('local')->exists($att2->file_path))->toBeTrue()
        ->and($need->fresh()->attachments)->toHaveCount(1)
        ->and($need->fresh()->attachments->first()->id)->toBe($att2->id);
});

it('can add and delete discrete attachments directly through the engine', function () {
    Config::set('filesystems.attachments_disk', 'local');
    Storage::fake('local');

    $need = Need::factory()->create();
    $engine = app(NeedProposalEngine::class);

    $file = UploadedFile::fake()->create('test.pdf', 200);

    $attachment = $engine->addAttachment($need, [
        'file' => $file,
        'display_name' => 'Test File',
        'category' => 'general',
    ]);

    expect($attachment->exists)->toBeTrue()
        ->and($attachment->display_name)->toBe('Test File')
        ->and(Storage::disk('local')->exists($attachment->file_path))->toBeTrue();

    $engine->deleteAttachment($attachment);

    expect(Storage::disk('local')->exists($attachment->file_path))->toBeFalse()
        ->and(Need::find($need->id)->attachments)->toHaveCount(0);
});

it('submits a new proposal in submitted status when shouldSubmit is true', function () {
    $group = NeedGroup::factory()->create();
    $unit = OrganizationalUnit::factory()->create();
    $type = NeedType::factory()->create();
    $engine = app(NeedProposalEngine::class);

    $payload = NeedProposalPayload::fromArray([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $type->id,
        'title' => 'Proposal with Direct Submit',
        'year' => 2026,
        'volume' => 1,
        'unit' => 'unit',
        'unit_price' => 1000000,
        'total_price' => 1000000,
        'urgency' => 'high',
        'impact' => 'high',
        'submit' => true,
    ]);

    $need = $engine->submit($payload);

    expect($need->status)->toBe(Need::STATUS_SUBMITTED);
    expect($need->is_locked)->toBeTrue();
    expect($need->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW);
});

it('updates an existing proposal and marks as submitted when shouldSubmit is true', function () {
    $need = Need::factory()->create(['status' => Need::STATUS_DRAFT, 'is_locked' => false]);
    $engine = app(NeedProposalEngine::class);

    $payload = NeedProposalPayload::fromArray([
        'title' => 'Updated and Submitted Proposal',
        'submit' => true,
    ]);

    $updated = $engine->update($need, $payload);

    expect($updated->title)->toBe('Updated and Submitted Proposal');
    expect($updated->status)->toBe(Need::STATUS_SUBMITTED);
    expect($updated->is_locked)->toBeTrue();
    expect($updated->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW);
});
