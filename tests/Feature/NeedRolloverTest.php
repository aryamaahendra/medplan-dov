<?php

declare(strict_types=1);

use App\Actions\Need\RolloverNeedAction;
use App\Models\Need;
use App\Models\NeedDetail;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->unit1 = OrganizationalUnit::factory()->create(['name' => 'Unit 1']);
    $this->unit2 = OrganizationalUnit::factory()->create(['name' => 'Unit 2']);
    $this->needType = NeedType::factory()->create();

    $this->group1 = NeedGroup::factory()->openWindow()->create(['year' => 2025, 'name' => 'Group 2025']);
    $this->group2 = NeedGroup::factory()->openWindow()->create(['year' => 2026, 'name' => 'Group 2026']);
});

it('unapproved candidates query excludes approved needs', function () {
    $this->be($this->admin);

    $unapprovedNeed = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $approvedNeed = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => now(),
    ]);

    $response = $this->getJson(route('needs.unapproved-candidates', [
        'target_need_group_id' => $this->group2->id,
    ]));

    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids)->toContain($unapprovedNeed->id)
        ->and($ids)->not->toContain($approvedNeed->id);
});

it('unapproved candidates query prioritizes proposals with next cycle recommendation', function () {
    $this->be($this->admin);

    $regularNeed = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
        'is_recommended_for_next_cycle' => false,
        'created_at' => now()->subDay(),
    ]);

    $recommendedNeed = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
        'is_recommended_for_next_cycle' => true,
        'recommended_volume' => 5,
        'created_at' => now()->subDays(2),
    ]);

    $response = $this->getJson(route('needs.unapproved-candidates', [
        'target_need_group_id' => $this->group2->id,
    ]));

    $response->assertOk();
    $data = $response->json('data');
    expect($data[0]['id'])->toBe($recommendedNeed->id);
});

it('unapproved candidates query excludes needs from the target group itself', function () {
    $this->be($this->admin);

    $needInGroup2 = Need::factory()->create([
        'need_group_id' => $this->group2->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $needInGroup1 = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $response = $this->getJson(route('needs.unapproved-candidates', [
        'target_need_group_id' => $this->group2->id,
    ]));

    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids)->toContain($needInGroup1->id)
        ->and($ids)->not->toContain($needInGroup2->id);
});

it('unapproved candidates query excludes needs already rolled over into the target group', function () {
    $this->be($this->admin);

    $sourceNeed = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    // Already rolled over into group2
    Need::factory()->create([
        'need_group_id' => $this->group2->id,
        'source_need_id' => $sourceNeed->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $response = $this->getJson(route('needs.unapproved-candidates', [
        'target_need_group_id' => $this->group2->id,
    ]));

    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids)->not->toContain($sourceNeed->id);
});

it('respects organizational unit scoping for regular users', function () {
    $userUnit1 = User::factory()->create(['organizational_unit_id' => $this->unit1->id]);
    $userUnit1->givePermissionTo('view needs');
    $this->be($userUnit1);

    $needUnit1 = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $needUnit2 = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit2->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $response = $this->getJson(route('needs.unapproved-candidates', [
        'target_need_group_id' => $this->group2->id,
    ]));

    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids)->toContain($needUnit1->id)
        ->and($ids)->not->toContain($needUnit2->id);
});

it('can fetch source detail of an unapproved need', function () {
    $this->be($this->admin);

    $need = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Pengadaan Laptop Perencana',
    ]);
    NeedDetail::factory()->create([
        'need_id' => $need->id,
        'background' => 'Latar belakang pengadaan laptop',
    ]);

    $response = $this->getJson(route('needs.unapproved-source', $need));

    $response->assertOk()
        ->assertJsonPath('data.title', 'Pengadaan Laptop Perencana')
        ->assertJsonPath('data.detail.background', 'Latar belakang pengadaan laptop');
});

it('can bulk rollover unapproved needs into a need group', function () {
    $this->be($this->admin);

    $need1 = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Satu',
        'volume' => 5,
        'unit' => 'unit',
        'unit_price' => 1000000,
        'total_price' => 5000000,
        'approved_by_director_at' => null,
    ]);
    NeedDetail::factory()->create([
        'need_id' => $need1->id,
        'background' => 'Latar belakang satu',
    ]);

    $need2 = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Dua',
        'volume' => 2,
        'unit' => 'paket',
        'unit_price' => 2000000,
        'total_price' => 4000000,
        'approved_by_director_at' => null,
    ]);

    $response = $this->post(route('need-groups.rollover', $this->group2), [
        'need_ids' => [$need1->id, $need2->id],
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('needs', [
        'need_group_id' => $this->group2->id,
        'source_need_id' => $need1->id,
        'title' => 'Usulan Satu',
        'year' => 2026,
        'status' => Need::STATUS_DRAFT,
        'approved_by_director_at' => null,
    ]);

    $this->assertDatabaseHas('need_details', [
        'background' => 'Latar belakang satu',
    ]);

    $this->assertDatabaseHas('needs', [
        'need_group_id' => $this->group2->id,
        'source_need_id' => $need2->id,
        'title' => 'Usulan Dua',
        'year' => 2026,
        'status' => Need::STATUS_DRAFT,
        'approved_by_director_at' => null,
    ]);

    expect($this->group2->fresh()->need_count)->toBe(2);
});

it('can rollover unapproved needs during need group creation', function () {
    $this->be($this->admin);

    $oldNeed = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Rollover Saat Buat Kelompok',
        'approved_by_director_at' => null,
    ]);

    $response = $this->post(route('need-groups.store'), [
        'name' => 'Kelompok Baru 2027',
        'year' => 2027,
        'description' => 'Deskripsi kelompok baru',
        'is_active' => true,
        'carry_over_need_ids' => [$oldNeed->id],
    ]);

    $response->assertRedirect();

    $newGroup = NeedGroup::where('name', 'Kelompok Baru 2027')->firstOrFail();

    $this->assertDatabaseHas('needs', [
        'need_group_id' => $newGroup->id,
        'source_need_id' => $oldNeed->id,
        'title' => 'Usulan Rollover Saat Buat Kelompok',
        'year' => 2027,
        'status' => Need::STATUS_DRAFT,
    ]);
});

it('unapproved candidates query includes partially approved needs with residual recommendation', function () {
    $this->be($this->admin);

    $partiallyApprovedWithResidual = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'status' => Need::STATUS_APPROVED,
        'approved_by_director_at' => now(),
        'volume' => 10,
        'approved_volume' => 6,
        'is_recommended_for_next_cycle' => true,
        'recommended_volume' => 4,
    ]);

    $fullyApprovedWithoutResidual = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'status' => Need::STATUS_APPROVED,
        'approved_by_director_at' => now(),
        'volume' => 10,
        'approved_volume' => 10,
        'is_recommended_for_next_cycle' => false,
        'recommended_volume' => null,
    ]);

    $response = $this->getJson(route('needs.unapproved-candidates', [
        'target_need_group_id' => $this->group2->id,
    ]));

    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids)->toContain($partiallyApprovedWithResidual->id)
        ->and($ids)->not->toContain($fullyApprovedWithoutResidual->id);
});

it('unapproved candidates query excludes rejected needs without recommendation for next cycle', function () {
    $this->be($this->admin);

    $rejectedWithoutRecommendation = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'status' => Need::STATUS_REJECTED,
        'approved_by_director_at' => null,
        'volume' => 10,
        'is_recommended_for_next_cycle' => false,
        'recommended_volume' => null,
    ]);

    $rejectedWithRecommendation = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'status' => Need::STATUS_REJECTED,
        'approved_by_director_at' => null,
        'volume' => 10,
        'is_recommended_for_next_cycle' => true,
        'recommended_volume' => 10,
    ]);

    $response = $this->getJson(route('needs.unapproved-candidates', [
        'target_need_group_id' => $this->group2->id,
    ]));

    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id')->all();
    expect($ids)->toContain($rejectedWithRecommendation->id)
        ->and($ids)->not->toContain($rejectedWithoutRecommendation->id);
});

it('clones partially approved need with requested volume set to residual recommended volume', function () {
    $this->be($this->admin);

    $sourceNeed = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'status' => Need::STATUS_APPROVED,
        'approved_by_director_at' => now(),
        'volume' => 10,
        'unit_price' => 25000,
        'total_price' => 250000,
        'approved_volume' => 6,
        'approved_unit_price' => 25000,
        'approved_total_price' => 150000,
        'is_recommended_for_next_cycle' => true,
        'recommended_volume' => 4,
        'is_locked' => true,
    ]);

    $action = app(RolloverNeedAction::class);
    $clonedNeed = $action->execute($sourceNeed, $this->group2, $this->admin);

    expect((float) $clonedNeed->volume)->toBe(4.0)
        ->and((float) $clonedNeed->unit_price)->toBe(25000.0)
        ->and((float) $clonedNeed->total_price)->toBe(100000.0)
        ->and($clonedNeed->status)->toBe(Need::STATUS_DRAFT)
        ->and($clonedNeed->approved_by_director_at)->toBeNull()
        ->and($clonedNeed->approved_volume)->toBeNull()
        ->and($clonedNeed->approved_unit_price)->toBeNull()
        ->and($clonedNeed->approved_total_price)->toBeNull()
        ->and($clonedNeed->is_recommended_for_next_cycle)->toBeFalse()
        ->and($clonedNeed->recommended_volume)->toBeNull()
        ->and($clonedNeed->is_locked)->toBeNull()
        ->and($clonedNeed->source_need_id)->toBe($sourceNeed->id);
});

it('validates that candidate ids in bulk rollover must be eligible for rollover', function () {
    $this->be($this->admin);

    $approvedNeed = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => now(),
        'is_recommended_for_next_cycle' => false,
    ]);

    $response = $this->post(route('need-groups.rollover', $this->group2), [
        'need_ids' => [$approvedNeed->id],
    ]);

    $response->assertSessionHasErrors('need_ids.0');
    $this->assertDatabaseMissing('needs', [
        'source_need_id' => $approvedNeed->id,
        'need_group_id' => $this->group2->id,
    ]);
});

it('prevents non-privileged unit staff from rolling over proposals belonging to another unit', function () {
    $staff = User::factory()->create(['organizational_unit_id' => $this->unit1->id]);
    $staff->givePermissionTo(['create needs', 'view needs']);
    $this->be($staff);

    $needUnit1 = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $needUnit2 = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit2->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $response = $this->post(route('need-groups.rollover', $this->group2), [
        'need_ids' => [$needUnit1->id, $needUnit2->id],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', '1 usulan berhasil ditarik ke kelompok ini.');

    $this->assertDatabaseHas('needs', [
        'source_need_id' => $needUnit1->id,
        'need_group_id' => $this->group2->id,
        'organizational_unit_id' => $this->unit1->id,
    ]);

    $this->assertDatabaseMissing('needs', [
        'source_need_id' => $needUnit2->id,
        'need_group_id' => $this->group2->id,
    ]);
});

it('allows unit head to rollover proposals belonging to descendant units but excludes other units', function () {
    $childUnit = OrganizationalUnit::factory()->create([
        'name' => 'Child Unit',
        'parent_id' => $this->unit1->id,
    ]);

    $unitHead = User::factory()->create(['organizational_unit_id' => $this->unit1->id]);
    $unitHead->givePermissionTo(['create descendant needs', 'view descendant needs']);
    $this->be($unitHead);

    $needOwnUnit = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $needChildUnit = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $childUnit->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $needOtherUnit = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit2->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $response = $this->post(route('need-groups.rollover', $this->group2), [
        'need_ids' => [$needOwnUnit->id, $needChildUnit->id, $needOtherUnit->id],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', '2 usulan berhasil ditarik ke kelompok ini.');

    $this->assertDatabaseHas('needs', [
        'source_need_id' => $needOwnUnit->id,
        'need_group_id' => $this->group2->id,
        'organizational_unit_id' => $this->unit1->id,
    ]);
    $this->assertDatabaseHas('needs', [
        'source_need_id' => $needChildUnit->id,
        'need_group_id' => $this->group2->id,
        'organizational_unit_id' => $childUnit->id,
    ]);
    $this->assertDatabaseMissing('needs', [
        'source_need_id' => $needOtherUnit->id,
        'need_group_id' => $this->group2->id,
    ]);
});

it('allows planner or super-admin to rollover proposals across all units', function () {
    $planner = User::factory()->create();
    $planner->assignRole('planner');
    $this->be($planner);

    $needUnit1 = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $needUnit2 = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit2->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $response = $this->post(route('need-groups.rollover', $this->group2), [
        'need_ids' => [$needUnit1->id, $needUnit2->id],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', '2 usulan berhasil ditarik ke kelompok ini.');

    $this->assertDatabaseHas('needs', [
        'source_need_id' => $needUnit1->id,
        'need_group_id' => $this->group2->id,
        'organizational_unit_id' => $this->unit1->id,
    ]);
    $this->assertDatabaseHas('needs', [
        'source_need_id' => $needUnit2->id,
        'need_group_id' => $this->group2->id,
        'organizational_unit_id' => $this->unit2->id,
    ]);
});

it('throws authorization exception when RolloverNeedAction::execute is called directly with unauthorized actor', function () {
    $staffUnit1 = User::factory()->create(['organizational_unit_id' => $this->unit1->id]);
    $staffUnit1->givePermissionTo(['create needs', 'view needs']);

    $needUnit2 = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit2->id,
        'need_type_id' => $this->needType->id,
        'approved_by_director_at' => null,
    ]);

    $action = app(RolloverNeedAction::class);

    expect(fn () => $action->execute($needUnit2, $this->group2, $staffUnit1))
        ->toThrow(AuthorizationException::class);
});

it('sets organizational_unit_id matching source need and preserves data integrity during rollover', function () {
    Storage::fake('local');
    Config::set('filesystems.attachments_disk', 'local');

    $sourceNeed = Need::factory()->create([
        'need_group_id' => $this->group1->id,
        'organizational_unit_id' => $this->unit1->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Proposal with Attachments and Details',
        'approved_by_director_at' => null,
    ]);

    NeedDetail::factory()->create([
        'need_id' => $sourceNeed->id,
        'background' => 'Detailed background text',
    ]);

    $sourceNeed->attachments()->create([
        'category' => 'general',
        'display_name' => 'spec.pdf',
        'file_path' => 'needs/source/spec.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
        'extension' => 'pdf',
    ]);
    Storage::disk('local')->put('needs/source/spec.pdf', 'dummy content');

    $action = app(RolloverNeedAction::class);
    $cloned = $action->execute($sourceNeed, $this->group2, $this->admin);

    expect($cloned->organizational_unit_id)->toBe($sourceNeed->organizational_unit_id)
        ->and($cloned->source_need_id)->toBe($sourceNeed->id)
        ->and($cloned->need_group_id)->toBe($this->group2->id)
        ->and($cloned->detail)->not->toBeNull()
        ->and($cloned->detail->background)->toBe('Detailed background text')
        ->and($cloned->attachments)->toHaveCount(1)
        ->and($cloned->attachments->first()->display_name)->toBe('spec.pdf')
        ->and(Storage::disk('local')->exists($cloned->attachments->first()->file_path))->toBeTrue();
});
