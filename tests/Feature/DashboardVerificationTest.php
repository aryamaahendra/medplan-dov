<?php

declare(strict_types=1);

use App\Actions\Need\GetNeedDashboardStatsAction;
use App\Enums\UserRole;
use App\Models\FundingSource;
use App\Models\Need;
use App\Models\NeedAttachment;
use App\Models\NeedDetail;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\Sasaran;
use App\Models\Tujuan;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;
use Tests\Support\DashboardTestOracle;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    Cache::flush();

    // Base Group 2026
    $this->group = NeedGroup::factory()->create([
        'name' => 'Usulan RKA 2026',
        'year' => 2026,
        'is_active' => true,
        'submission_start_at' => CarbonImmutable::create(2026, 1, 1, 8, 0, 0, 'Asia/Makassar'),
        'submission_end_at' => CarbonImmutable::create(2026, 12, 31, 23, 59, 59, 'Asia/Makassar'),
    ]);

    // Comparison Group 2025
    $this->prevGroup = NeedGroup::factory()->create([
        'name' => 'Usulan RKA 2025',
        'year' => 2025,
        'is_active' => false,
        'submission_start_at' => CarbonImmutable::create(2025, 1, 1, 8, 0, 0, 'Asia/Makassar'),
        'submission_end_at' => CarbonImmutable::create(2025, 12, 31, 23, 59, 59, 'Asia/Makassar'),
    ]);

    // Organizational Units Hierarchy
    $this->parentUnit = OrganizationalUnit::factory()->create(['name' => 'Direktorat Pelayanan Medik']);
    $this->unitA = OrganizationalUnit::factory()->create(['name' => 'Instalasi Rawat Inap', 'parent_id' => $this->parentUnit->id]);
    $this->unitB = OrganizationalUnit::factory()->create(['name' => 'Instalasi Bedah Sentral', 'parent_id' => $this->parentUnit->id]);
    $this->unitC = OrganizationalUnit::factory()->create(['name' => 'Instalasi Farmasi']);

    // Need Types
    $this->typeMedis = NeedType::factory()->create(['name' => 'Alat Kesehatan', 'code' => 'ALKES']);
    $this->typeNonMedis = NeedType::factory()->create(['name' => 'Sarana Prasarana', 'code' => 'SARPRAS']);

    // Users
    $this->superAdmin = User::factory()->create(['organizational_unit_id' => $this->parentUnit->id]);
    $this->superAdmin->assignRole(UserRole::SuperAdmin->value);

    $this->director = User::factory()->create(['organizational_unit_id' => $this->parentUnit->id]);
    $this->director->assignRole(UserRole::Director->value);

    $this->unitHead = User::factory()->create(['organizational_unit_id' => $this->parentUnit->id]);
    $this->unitHead->assignRole(UserRole::UnitHead->value);

    $this->staffA = User::factory()->create(['organizational_unit_id' => $this->unitA->id]);
    $this->staffA->assignRole(UserRole::Staff->value);

    $this->staffC = User::factory()->create(['organizational_unit_id' => $this->unitC->id]);
    $this->staffC->assignRole(UserRole::Staff->value);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 1: Happy Path (Known fixture with hand-computed literals & oracle)
|--------------------------------------------------------------------------
*/
test('case 1: happy path with mixed states and amounts equals oracle and hand-computed literals', function () {
    // 1. Draft need (unitA, typeMedis)
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'need_type_id' => $this->typeMedis->id,
        'status' => 'draft',
        'is_priority' => false,
        'checklist_percentage' => 40.0,
        'total_price' => 10_000_000.00,
        'approved_by_director_at' => null,
    ]);

    // 2. Under review priority need (unitA, typeMedis)
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'need_type_id' => $this->typeMedis->id,
        'status' => 'approved',
        'is_priority' => true,
        'checklist_percentage' => 85.0,
        'total_price' => 25_000_000.00,
        'approved_by_director_at' => null,
    ]);

    // 3. Approved need by director (unitB, typeNonMedis)
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitB->id,
        'need_type_id' => $this->typeNonMedis->id,
        'status' => 'approved',
        'is_priority' => true,
        'checklist_percentage' => 95.0,
        'total_price' => 50_000_000.00,
        'approved_by_director_at' => CarbonImmutable::now('Asia/Makassar'),
    ]);

    // 4. Rejected need (unitB, typeNonMedis)
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitB->id,
        'need_type_id' => $this->typeNonMedis->id,
        'status' => 'rejected',
        'is_priority' => false,
        'checklist_percentage' => 20.0,
        'total_price' => 5_000_000.00,
        'approved_by_director_at' => null,
    ]);

    // Hand-computed expected values:
    // Total needs = 4
    // Active needs = 3 (excluding rejected)
    // Total budget = 10M + 25M + 50M = 85_000_000.00
    // Approved budget = 50_000_000.00
    // Awaiting director budget = 25_000_000.00
    // Draft budget = 10_000_000.00
    // Rejected budget = 5_000_000.00
    // Priority count = 2 (items 2 & 3)
    // Priority budget = 25M + 50M = 75_000_000.00
    // Unapproved priority count = 1 (item 2)
    // Unapproved priority budget = 25_000_000.00
    // Assessed count (checklist > 0 & non-rejected) = 3 (items 1, 2, 3)
    // Avg completeness = (40 + 85 + 95) / 3 = 220 / 3 = 73.3333...

    $oracle = DashboardTestOracle::computeKpiStats($this->group->id);

    expect($oracle['total_needs'])->toBe(4)
        ->and($oracle['active_needs_count'])->toBe(3)
        ->and($oracle['total_budget'])->toBe(85_000_000.0)
        ->and($oracle['approved_budget'])->toBe(50_000_000.0)
        ->and($oracle['awaiting_director_budget'])->toBe(25_000_000.0)
        ->and($oracle['draft_budget'])->toBe(10_000_000.0)
        ->and($oracle['rejected_budget'])->toBe(5_000_000.0)
        ->and($oracle['priority_needs'])->toBe(2)
        ->and($oracle['priority_budget'])->toBe(75_000_000.0)
        ->and($oracle['unapproved_priority_count'])->toBe(1)
        ->and($oracle['unapproved_priority_budget'])->toBe(25_000_000.0)
        ->and($oracle['assessed_needs_count'])->toBe(3)
        ->and(round($oracle['avg_completeness'], 1))->toBe(73.3);

    // App output comparison
    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    expect($payload['stats']['total_needs'])->toBe($oracle['total_needs'])
        ->and($payload['stats']['active_needs_count'])->toBe($oracle['active_needs_count'])
        ->and($payload['stats']['total_budget'])->toBe($oracle['total_budget'])
        ->and($payload['stats']['approved_budget'])->toBe($oracle['approved_budget'])
        ->and($payload['stats']['awaiting_director_budget'])->toBe($oracle['awaiting_director_budget'])
        ->and($payload['stats']['draft_budget'])->toBe($oracle['draft_budget'])
        ->and($payload['stats']['rejected_budget'])->toBe($oracle['rejected_budget'])
        ->and($payload['stats']['priority_needs'])->toBe($oracle['priority_needs'])
        ->and($payload['stats']['unapproved_priority_count'])->toBe($oracle['unapproved_priority_count'])
        ->and($payload['stats']['unapproved_priority_budget'])->toBe($oracle['unapproved_priority_budget'])
        ->and($payload['stats']['assessed_needs_count'])->toBe($oracle['assessed_needs_count'])
        ->and(round($payload['stats']['avg_completeness'], 1))->toBe(73.3);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 2: Empty Dataset (No records in group)
|--------------------------------------------------------------------------
*/
test('case 2: empty dataset returns zeroed metrics without errors or NaN', function () {
    $emptyGroup = NeedGroup::factory()->create(['year' => 2027]);

    $oracle = DashboardTestOracle::computeKpiStats($emptyGroup->id);
    expect($oracle['total_needs'])->toBe(0)
        ->and($oracle['total_budget'])->toBe(0.0)
        ->and($oracle['avg_completeness'])->toBe(0.0);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($emptyGroup->id, $this->superAdmin);

    expect($payload['stats']['total_needs'])->toBe(0)
        ->and($payload['stats']['active_needs_count'])->toBe(0)
        ->and($payload['stats']['total_budget'])->toBe(0.0)
        ->and($payload['stats']['approved_budget'])->toBe(0.0)
        ->and($payload['stats']['awaiting_director_budget'])->toBe(0.0)
        ->and($payload['stats']['draft_budget'])->toBe(0.0)
        ->and($payload['stats']['rejected_budget'])->toBe(0.0)
        ->and($payload['stats']['avg_completeness'])->toBe(0.0)
        ->and($payload['stageDistribution']['draft']['percentage'])->toBe(0.0)
        ->and($payload['stageDistribution']['under_review']['percentage'])->toBe(0.0)
        ->and($payload['stageDistribution']['approved']['percentage'])->toBe(0.0)
        ->and($payload['stageDistribution']['rejected']['percentage'])->toBe(0.0)
        ->and($payload['dataReadiness']['attachment_coverage'])->toBe(0.0)
        ->and($payload['dataReadiness']['alignment_coverage'])->toBe(0.0)
        ->and($payload['dataReadiness']['kak_detail_coverage'])->toBe(0.0);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 3: Single Record (Smallest non-empty dataset)
|--------------------------------------------------------------------------
*/
test('case 3: single record smallest non-empty dataset', function () {
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'is_priority' => false,
        'checklist_percentage' => 50.0,
        'total_price' => 1_500_000.00,
        'approved_by_director_at' => null,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    expect($payload['stats']['total_needs'])->toBe(1)
        ->and($payload['stats']['active_needs_count'])->toBe(1)
        ->and($payload['stats']['total_budget'])->toBe(1_500_000.0)
        ->and($payload['stats']['draft_count'])->toBe(1)
        ->and($payload['stats']['draft_budget'])->toBe(1_500_000.0)
        ->and($payload['stats']['avg_completeness'])->toBe(50.0)
        ->and($payload['stats']['approved_by_director'])->toBe(0);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 4: Status and State Filtering
|--------------------------------------------------------------------------
*/
test('case 4: status and stage filtering correctly partitions draft, under_review, approved, rejected', function () {
    // Stage 1: Draft (status='draft', approved_by_director_at=null)
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'approved_by_director_at' => null,
        'total_price' => 1000,
    ]);

    // Stage 2: Under Review (status='approved', approved_by_director_at=null)
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'approved',
        'approved_by_director_at' => null,
        'total_price' => 2000,
    ]);

    // Stage 3: Approved (approved_by_director_at IS NOT NULL)
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'approved',
        'approved_by_director_at' => now(),
        'total_price' => 3000,
    ]);

    // Stage 4: Rejected (status='rejected')
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'rejected',
        'approved_by_director_at' => null,
        'total_price' => 4000,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    expect($payload['stats']['draft_count'])->toBe(1)
        ->and($payload['stats']['awaiting_director'])->toBe(1)
        ->and($payload['stats']['approved_by_director'])->toBe(1)
        ->and($payload['stats']['rejected_count'])->toBe(1)
        ->and($payload['stats']['active_needs_count'])->toBe(3)
        ->and($payload['stats']['total_needs'])->toBe(4);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 5: Soft-Deleted Records
|--------------------------------------------------------------------------
*/
test('case 5: soft-deleted records are strictly excluded from all metrics including funding sources', function () {
    $activeNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 10_000_000,
    ]);

    $softDeletedNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 20_000_000,
        'deleted_at' => now(),
    ]);

    // Add funding sources to both
    $funding = FundingSource::factory()->create(['name' => 'APBD Tingkat I']);
    $activeDetail = NeedDetail::factory()->create(['need_id' => $activeNeed->id]);
    $activeDetail->fundingSources()->attach($funding->id);

    $deletedDetail = NeedDetail::factory()->create(['need_id' => $softDeletedNeed->id]);
    $deletedDetail->fundingSources()->attach($funding->id);

    $oracle = DashboardTestOracle::computeKpiStats($this->group->id);
    expect($oracle['total_needs'])->toBe(1)
        ->and($oracle['total_budget'])->toBe(10_000_000.0);

    $fundingOracle = DashboardTestOracle::computeFundingSources($this->group->id);
    expect($fundingOracle)->toHaveCount(1)
        ->and($fundingOracle[0]['needs_count'])->toBe(1)
        ->and($fundingOracle[0]['total_budget'])->toBe(10_000_000.0);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    expect($payload['stats']['total_needs'])->toBe(1)
        ->and($payload['stats']['total_budget'])->toBe(10_000_000.0);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 6: Date Boundaries & Timezone (Asia/Makassar)
|--------------------------------------------------------------------------
*/
test('case 6: submission window status reflects Asia/Makassar timezone boundaries', function () {
    // Window ends at 2026-06-30 23:59:59 WITA
    $closingGroup = NeedGroup::factory()->create([
        'is_active' => true,
        'submission_start_at' => CarbonImmutable::create(2026, 6, 1, 0, 0, 0, 'Asia/Makassar'),
        'submission_end_at' => CarbonImmutable::create(2026, 6, 30, 23, 59, 59, 'Asia/Makassar'),
    ]);

    // Just before closing
    CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 6, 30, 23, 59, 58, 'Asia/Makassar'));
    expect($closingGroup->isOpenForSubmission())->toBeTrue()
        ->and($closingGroup->getSubmissionWindowStatus())->toBe('open');

    // Just after closing
    CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 7, 1, 0, 0, 1, 'Asia/Makassar'));
    expect($closingGroup->isOpenForSubmission())->toBeFalse()
        ->and($closingGroup->getSubmissionWindowStatus())->toBe('closed');

    CarbonImmutable::setTestNow(null);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 7: Zero Denominator
|--------------------------------------------------------------------------
*/
test('case 7: zero denominator handles zero budgets and zero counts safely without NaN', function () {
    // Only rejected need exists -> total_budget is 0.0
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'rejected',
        'total_price' => 5_000_000,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    expect($payload['stats']['total_budget'])->toBe(0.0)
        ->and($payload['stats']['active_needs_count'])->toBe(0)
        ->and($payload['stats']['rejected_count'])->toBe(1)
        ->and($payload['stageDistribution']['draft']['percentage'])->toBe(0.0)
        ->and($payload['stageDistribution']['under_review']['percentage'])->toBe(0.0)
        ->and($payload['stageDistribution']['approved']['percentage'])->toBe(0.0)
        ->and($payload['stats']['avg_completeness'])->toBe(0.0);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 8: NULL and Missing Fields
|--------------------------------------------------------------------------
*/
test('case 8: nullable fields do not break aggregations', function () {
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'volume' => 1.0,
        'unit' => 'unit',
        'unit_price' => 0.0,
        'total_price' => 0.0,
        'checklist_percentage' => 0.0,
        'notes' => null,
        'unlocked_until' => null,
        'locked_at' => null,
        'locked_by_user_id' => null,
        'approved_by_director_at' => null,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    expect($payload['stats']['total_needs'])->toBe(1)
        ->and($payload['stats']['total_budget'])->toBe(0.0)
        ->and($payload['stats']['avg_completeness'])->toBe(0.0)
        ->and($payload['stats']['assessed_needs_count'])->toBe(0);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 9: Precision & Exact Rounding
|--------------------------------------------------------------------------
*/
test('case 9: exact decimal precision for money and rounding rules', function () {
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 1234567.89,
        'checklist_percentage' => 33.33,
    ]);

    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 9876543.21,
        'checklist_percentage' => 66.67,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    // 1234567.89 + 9876543.21 = 11111111.10
    expect($payload['stats']['total_budget'])->toBe(11111111.10)
        ->and(round($payload['stats']['avg_completeness'], 1))->toBe(50.0);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 10: Large Values
|--------------------------------------------------------------------------
*/
test('case 10: large budget values do not overflow or lose precision', function () {
    // 500 Billion Rupiah
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'approved',
        'approved_by_director_at' => now(),
        'total_price' => 500_000_000_000.00,
    ]);

    // 250 Billion Rupiah
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 250_000_000_000.00,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    expect($payload['stats']['total_budget'])->toBe(750_000_000_000.0)
        ->and($payload['stats']['approved_budget'])->toBe(500_000_000_000.0);
});

/*
|--------------------------------------------------------------------------
| 4A. Cases 11 & 12: Join Fan-Out and Duplicates Prevention
|--------------------------------------------------------------------------
*/
test('case 11 and 12: join fan-out prevention on attachments and multiple linkages', function () {
    $need = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 10_000_000,
    ]);

    // Create 3 attachments for the same need
    NeedAttachment::factory()->count(3)->create(['need_id' => $need->id]);

    // Create detail with 2 funding sources
    $detail = NeedDetail::factory()->create(['need_id' => $need->id]);
    $fs1 = FundingSource::factory()->create(['name' => 'BLUD']);
    $fs2 = FundingSource::factory()->create(['name' => 'APBN']);
    $detail->fundingSources()->attach([$fs1->id, $fs2->id]);

    // Attach to 2 Sasarans
    $tujuan = Tujuan::factory()->create();
    $s1 = Sasaran::factory()->create(['tujuan_id' => $tujuan->id]);
    $s2 = Sasaran::factory()->create(['tujuan_id' => $tujuan->id]);
    $need->sasarans()->attach([$s1->id, $s2->id]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    // Total needs must remain strictly 1, total_budget must remain strictly 10M
    expect($payload['stats']['total_needs'])->toBe(1)
        ->and($payload['stats']['total_budget'])->toBe(10_000_000.0)
        ->and($payload['dataReadiness']['attachment_coverage'])->toBe(100.0)
        ->and($payload['dataReadiness']['alignment_coverage'])->toBe(100.0)
        ->and($payload['dataReadiness']['kak_detail_coverage'])->toBe(100.0);
});

/*
|--------------------------------------------------------------------------
| 4A. Cases 13 & 14: Authorization Scoping & Unit Isolation
|--------------------------------------------------------------------------
*/
test('case 13 and 14: authorization scoping and unit isolation across super-admin, unit-head, and staff', function () {
    // Unit A Need (under parentUnit)
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 10_000_000,
    ]);

    // Unit B Need (under parentUnit)
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitB->id,
        'status' => 'draft',
        'total_price' => 20_000_000,
    ]);

    // Unit C Need (standalone unit)
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitC->id,
        'status' => 'draft',
        'total_price' => 40_000_000,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);

    // 1. Super Admin sees all (Unit A + B + C = 70M)
    $adminPayload = $action->getDashboardPayload($this->group->id, $this->superAdmin);
    expect($adminPayload['stats']['total_needs'])->toBe(3)
        ->and($adminPayload['stats']['total_budget'])->toBe(70_000_000.0);

    // 2. Unit Head of Parent Unit sees descendants (Unit A + B = 30M), excludes Unit C
    $unitHeadPayload = $action->getDashboardPayload($this->group->id, $this->unitHead);
    expect($unitHeadPayload['stats']['total_needs'])->toBe(2)
        ->and($unitHeadPayload['stats']['total_budget'])->toBe(30_000_000.0);

    // 3. Staff A sees only Unit A (10M), completely isolated from Unit B and C
    $staffAPayload = $action->getDashboardPayload($this->group->id, $this->staffA);
    expect($staffAPayload['stats']['total_needs'])->toBe(1)
        ->and($staffAPayload['stats']['total_budget'])->toBe(10_000_000.0);

    // 4. Staff C sees only Unit C (40M), completely isolated from Unit A and B
    $staffCPayload = $action->getDashboardPayload($this->group->id, $this->staffC);
    expect($staffCPayload['stats']['total_needs'])->toBe(1)
        ->and($staffCPayload['stats']['total_budget'])->toBe(40_000_000.0);
});

/*
|--------------------------------------------------------------------------
| 4A. Cases 15 & 16: Trend and Comparison Deltas
|--------------------------------------------------------------------------
*/
test('case 15 and 16: trend and comparison deltas vs previous period', function () {
    // Current group: 100M
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 100_000_000,
        'is_priority' => true,
    ]);

    // Previous group: 50M
    Need::factory()->create([
        'need_group_id' => $this->prevGroup->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 50_000_000,
        'is_priority' => false,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin, $this->prevGroup->id);

    expect($payload['stats']['total_budget'])->toBe(100_000_000.0)
        ->and($payload['stats']['prev_total_budget'])->toBe(50_000_000.0)
        ->and($payload['stats']['priority_needs'])->toBe(1)
        ->and($payload['stats']['prev_priority_needs'])->toBe(0);

    // Delta: (100M - 50M) / 50M * 100 = +100%
    $deltaPct = (int) round((($payload['stats']['total_budget'] - $payload['stats']['prev_total_budget']) / $payload['stats']['prev_total_budget']) * 100);
    expect($deltaPct)->toBe(100);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 17: Grouping, Ranking, and Top-N
|--------------------------------------------------------------------------
*/
test('case 17: grouping, ranking and top-N sorting by budget descending', function () {
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'need_type_id' => $this->typeMedis->id,
        'status' => 'draft',
        'total_price' => 10_000_000,
    ]);

    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitB->id,
        'need_type_id' => $this->typeNonMedis->id,
        'status' => 'draft',
        'total_price' => 50_000_000,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    // Needs by Unit must rank Unit B (50M) first, then Unit A (10M)
    expect($payload['needsByUnit'][0]['unit_id'])->toBe($this->unitB->id)
        ->and($payload['needsByUnit'][0]['total_budget'])->toBe(50_000_000.0)
        ->and($payload['needsByUnit'][1]['unit_id'])->toBe($this->unitA->id)
        ->and($payload['needsByUnit'][1]['total_budget'])->toBe(10_000_000.0);

    // Needs by Type must rank NonMedis (50M) first, then Medis (10M)
    expect($payload['needsByType'][0]['type_id'])->toBe($this->typeNonMedis->id)
        ->and($payload['needsByType'][0]['total_budget'])->toBe(50_000_000.0)
        ->and($payload['needsByType'][1]['type_id'])->toBe($this->typeMedis->id)
        ->and($payload['needsByType'][1]['total_budget'])->toBe(10_000_000.0);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 18: Cache Lifecycle & Invalidation
|--------------------------------------------------------------------------
*/
test('case 18: cache lifecycle and invalidation on clearCacheForGroup', function () {
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 10_000_000,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload1 = $action->getDashboardPayload($this->group->id, $this->superAdmin);
    expect($payload1['stats']['total_needs'])->toBe(1);

    // Add a second need
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 20_000_000,
    ]);

    // Without cache clearing, cached version is returned
    $cachedPayload = $action->getDashboardPayload($this->group->id, $this->superAdmin);
    expect($cachedPayload['stats']['total_needs'])->toBe(1);

    // Clear cache
    Cache::flush();
    $freshPayload = $action->getDashboardPayload($this->group->id, $this->superAdmin);
    expect($freshPayload['stats']['total_needs'])->toBe(2);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 19: Idempotency
|--------------------------------------------------------------------------
*/
test('case 19: idempotency of dashboard payload generation', function () {
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 10_000_000,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $run1 = $action->getDashboardPayload($this->group->id, $this->superAdmin);
    $run2 = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    expect($run1)->toEqual($run2);
});

/*
|--------------------------------------------------------------------------
| 4A. Case 20: Performance Sanity (Bounded Query Count)
|--------------------------------------------------------------------------
*/
test('case 20: performance sanity and bounded query count without N+1', function () {
    // Seed 10 needs across 3 units and 2 types
    Need::factory()->count(10)->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'need_type_id' => $this->typeMedis->id,
        'status' => 'draft',
    ]);

    Cache::flush();
    DB::enableQueryLog();

    $action = app(GetNeedDashboardStatsAction::class);
    $action->getDashboardPayload($this->group->id, $this->superAdmin);

    $queriesCount = count(DB::getQueryLog());
    DB::disableQueryLog();

    // Must be bounded (< 55 queries for entire multi-domain payload across 3 dashboards)
    expect($queriesCount)->toBeLessThan(55);
});

/*
|--------------------------------------------------------------------------
| 4B. Cross-Metric Consistency Invariants
|--------------------------------------------------------------------------
*/
test('cross-metric invariant: stage counts and budgets partition properly', function () {
    Need::factory()->create(['need_group_id' => $this->group->id, 'organizational_unit_id' => $this->unitA->id, 'status' => 'draft', 'total_price' => 1000]);
    Need::factory()->create(['need_group_id' => $this->group->id, 'organizational_unit_id' => $this->unitA->id, 'status' => 'approved', 'approved_by_director_at' => null, 'total_price' => 2000]);
    Need::factory()->create(['need_group_id' => $this->group->id, 'organizational_unit_id' => $this->unitA->id, 'status' => 'approved', 'approved_by_director_at' => now(), 'total_price' => 3000]);
    Need::factory()->create(['need_group_id' => $this->group->id, 'organizational_unit_id' => $this->unitA->id, 'status' => 'rejected', 'total_price' => 4000]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);
    $stats = $payload['stats'];

    // Invariant 1: Total needs == Active needs + Rejected count
    expect($stats['total_needs'])->toBe($stats['active_needs_count'] + $stats['rejected_count']);

    // Invariant 2: Active needs count == Draft + Under Review + Approved
    expect($stats['active_needs_count'])->toBe($stats['draft_count'] + $stats['awaiting_director'] + $stats['approved_by_director']);

    // Invariant 3: Active total budget == Draft budget + Under Review budget + Approved budget
    expect($stats['total_budget'])->toBe($stats['draft_budget'] + $stats['awaiting_director_budget'] + $stats['approved_budget']);

    // Invariant 4: Sum of needsByUnit budgets == stats.total_budget
    $unitBudgetSum = array_sum(array_column($payload['needsByUnit'], 'total_budget'));
    expect($unitBudgetSum)->toBe($stats['total_budget']);

    // Invariant 5: Sum of needsByType budgets == stats.total_budget
    $typeBudgetSum = array_sum(array_column($payload['needsByType'], 'total_budget'));
    expect($typeBudgetSum)->toBe($stats['total_budget']);

    // Invariant 6: Stage breakdown percentages sum to 100%
    $stagePctSum = $payload['stageDistribution']['draft']['percentage']
        + $payload['stageDistribution']['under_review']['percentage']
        + $payload['stageDistribution']['approved']['percentage']
        + $payload['stageDistribution']['rejected']['percentage'];
    expect(round($stagePctSum, 0))->toBe(100.0);
});

/*
|--------------------------------------------------------------------------
| 4C. API / Data-Contract Test
|--------------------------------------------------------------------------
*/
test('contract: payload response shape and data types conform to dashboard contract', function () {
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 1000,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    // Required top-level keys
    expect($payload)->toHaveKeys([
        'currentGroup',
        'availableGroups',
        'stats',
        'stageDistribution',
        'statusDistribution',
        'matrix',
        'decisionQueue',
        'needsByUnit',
        'needsByType',
        'allUnitProgress',
        'dataReadiness',
        'exceptions',
        'activeUnlocks',
        'sasaranOverview',
        'fundingSources',
        'checklistBuckets',
        'myUnitData',
        'sizeBuckets',
        'unitTypeMatrix',
        'operations',
    ]);

    // Data types in stats
    expect($payload['stats']['total_needs'])->toBeInt()
        ->and($payload['stats']['active_needs_count'])->toBeInt()
        ->and($payload['stats']['total_budget'])->toBeFloat()
        ->and($payload['stats']['approved_budget'])->toBeFloat()
        ->and($payload['stats']['priority_budget'])->toBeFloat()
        ->and($payload['stats']['avg_completeness'])->toBeFloat();
});
