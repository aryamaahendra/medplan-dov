<?php

use App\Actions\Need\GetFilteredNeedsAction;
use App\Actions\Need\GetNeedDashboardStatsAction;
use App\Enums\UserRole;
use App\Exceptions\Need\NeedExceptionCatalog;
use App\Models\Indicator;
use App\Models\KpiIndicator;
use App\Models\Need;
use App\Models\NeedAttachment;
use App\Models\NeedGroup;
use App\Models\OrganizationalUnit;
use App\Models\Sasaran;
use App\Models\StrategicServicePlan;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->unit = OrganizationalUnit::factory()->create(['name' => 'Unit Pelayanan Medis']);

    $this->admin = User::factory()->create(['organizational_unit_id' => $this->unit->id]);
    $this->admin->assignRole(UserRole::SuperAdmin->value);

    $this->now = CarbonImmutable::parse('2026-10-08 12:00:00', 'Asia/Makassar');

    $this->group = NeedGroup::factory()->create([
        'name' => 'Usulan 2026',
        'year' => 2026,
        'is_active' => true,
        'submission_start_at' => $this->now->subDays(10),
        'submission_end_at' => $this->now->addDays(4), // window ends in 4 days (<= 7 days, so E1 active)
    ]);

    $this->catalog = app(NeedExceptionCatalog::class);
});

test('E1 detects drafts in group closing within 7 days', function () {
    $e1Draft = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'draft',
        'approved_by_director_at' => null,
    ]);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E1'], $this->now);

    expect($query->pluck('id')->all())->toContain($e1Draft->id);
});

test('E2 detects idle drafts older than 7 days', function () {
    $idleDraft = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'draft',
        'updated_at' => $this->now->subDays(10),
    ]);

    $freshDraft = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'draft',
        'updated_at' => $this->now->subDays(2),
    ]);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E2'], $this->now);

    $ids = $query->pluck('id')->all();
    expect($ids)->toContain($idleDraft->id)
        ->and($ids)->not->toContain($freshDraft->id);
});

test('E3 detects assessed needs with checklist below 85 percent', function () {
    $lowChecklist = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'draft',
        'checklist_percentage' => 70,
    ]);

    $highChecklist = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'draft',
        'checklist_percentage' => 90,
    ]);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E3'], $this->now);

    $ids = $query->pluck('id')->all();
    expect($ids)->toContain($lowChecklist->id)
        ->and($ids)->not->toContain($highChecklist->id);
});

test('E4 detects needs under review with zero checklist score', function () {
    $unassessedReview = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'approved',
        'approved_by_director_at' => null,
        'checklist_percentage' => 0,
    ]);

    $assessedReview = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'approved',
        'approved_by_director_at' => null,
        'checklist_percentage' => 95,
    ]);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E4'], $this->now);

    $ids = $query->pluck('id')->all();
    expect($ids)->toContain($unassessedReview->id)
        ->and($ids)->not->toContain($assessedReview->id);
});

test('E5 detects needs under review idle for 5 days or more', function () {
    $idleReview = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'approved',
        'approved_by_director_at' => null,
        'updated_at' => $this->now->subDays(6),
    ]);

    $freshReview = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'approved',
        'approved_by_director_at' => null,
        'updated_at' => $this->now->subDays(2),
    ]);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E5'], $this->now);

    $ids = $query->pluck('id')->all();
    expect($ids)->toContain($idleReview->id)
        ->and($ids)->not->toContain($freshReview->id);
});

test('E6 detects needs under review missing mandatory linkages', function () {
    $unlinkedReview = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'approved',
        'approved_by_director_at' => null,
    ]);

    $linkedReview = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'approved',
        'approved_by_director_at' => null,
    ]);
    NeedAttachment::factory()->create(['need_id' => $linkedReview->id]);
    $linkedReview->sasarans()->attach(Sasaran::factory()->create()->id);
    $linkedReview->indicators()->attach(Indicator::factory()->create()->id);
    $linkedReview->kpiIndicators()->attach(KpiIndicator::factory()->create()->id);
    $linkedReview->strategicServicePlans()->attach(StrategicServicePlan::factory()->create()->id);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E6'], $this->now);

    $ids = $query->pluck('id')->all();
    expect($ids)->toContain($unlinkedReview->id)
        ->and($ids)->not->toContain($linkedReview->id);
});

test('E7 detects rejected needs idle for 7 days or more', function () {
    $idleRejected = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'rejected',
        'updated_at' => $this->now->subDays(8),
    ]);

    $freshRejected = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'rejected',
        'updated_at' => $this->now->subDays(1),
    ]);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E7'], $this->now);

    $ids = $query->pluck('id')->all();
    expect($ids)->toContain($idleRejected->id)
        ->and($ids)->not->toContain($freshRejected->id);
});

test('E9 detects both expiring unlock windows and locked drafts with low checklist', function () {
    // 1. Expiring temporary unlock window (within 3 days)
    $expiringUnlock = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'unlocked_until' => $this->now->addDays(2),
    ]);

    // 2. Locked draft with checklist < 85%
    $lockedDraft = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'draft',
        'is_locked' => true,
        'checklist_percentage' => 50,
    ]);

    // 3. Normal unlocked draft
    $normalDraft = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'draft',
        'is_locked' => false,
        'checklist_percentage' => 50,
    ]);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E9'], $this->now);

    $ids = $query->pluck('id')->all();
    expect($ids)->toContain($expiringUnlock->id)
        ->and($ids)->toContain($lockedDraft->id)
        ->and($ids)->not->toContain($normalDraft->id);
});

test('multi-key attention filtering works via OR conjunction without time corruption', function () {
    CarbonImmutable::setTestNow($this->now);

    try {
        $e2Need = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->unit->id,
            'status' => 'draft',
            'updated_at' => $this->now->subDays(10),
        ]);

        $e7Need = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->unit->id,
            'status' => 'rejected',
            'updated_at' => $this->now->subDays(12),
        ]);

        $healthyDraft = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->unit->id,
            'status' => 'draft',
            'updated_at' => $this->now->subDay(),
        ]);

        $filteredQuery = app(GetFilteredNeedsAction::class)->execute([
            'attention' => ['E2', 'E7'],
            'need_group_id' => $this->group->id,
        ], $this->admin);

        $ids = $filteredQuery->pluck('id')->all();
        expect($ids)->toContain($e2Need->id)
            ->and($ids)->toContain($e7Need->id)
            ->and($ids)->not->toContain($healthyDraft->id);
    } finally {
        CarbonImmutable::setTestNow();
    }
});
test('GetNeedDashboardStatsAction and GetFilteredNeedsAction are in lockstep for exception filters', function () {
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => 'draft',
        'updated_at' => now()->subDays(10),
    ]);

    $statsAction = app(GetNeedDashboardStatsAction::class);
    $payload = $statsAction->getDashboardPayload($this->group->id, $this->admin);

    $e2StatsItem = collect($payload['operations']['exceptions'])->firstWhere('code', 'E2');
    expect($e2StatsItem)->not->toBeNull();

    $filterAction = app(GetFilteredNeedsAction::class);
    $filteredNeeds = $filterAction->execute([
        'attention' => ['E2'],
        'need_group_id' => $this->group->id,
    ], $this->admin)->get();

    expect($filteredNeeds->count())->toBe($e2StatsItem['count']);
});

test('E4 detects modern submitted proposals with zero checklist score', function () {
    $unassessedSubmitted = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => Need::STATUS_SUBMITTED,
        'checklist_percentage' => 0,
    ]);

    $assessedSubmitted = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => Need::STATUS_SUBMITTED,
        'checklist_percentage' => 95,
    ]);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E4'], $this->now);

    $ids = $query->pluck('id')->all();
    expect($ids)->toContain($unassessedSubmitted->id)
        ->and($ids)->not->toContain($assessedSubmitted->id);

    // Also test buildExceptionItems aggregation
    $items = $this->catalog->buildExceptionItems(Need::query()->where('need_group_id', $this->group->id), $this->group, 4, [], $this->now);
    $e4Item = collect($items)->firstWhere('code', 'E4');
    expect($e4Item['count'])->toBeGreaterThanOrEqual(1);
    expect(collect($e4Item['needs'])->pluck('id')->all())->toContain($unassessedSubmitted->id);
});

test('E5 detects modern submitted proposals idle for more than 5 days', function () {
    $idleSubmitted = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => Need::STATUS_SUBMITTED,
        'updated_at' => $this->now->subDays(6),
    ]);

    $freshSubmitted = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => Need::STATUS_SUBMITTED,
        'updated_at' => $this->now->subDays(2),
    ]);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E5'], $this->now);

    $ids = $query->pluck('id')->all();
    expect($ids)->toContain($idleSubmitted->id)
        ->and($ids)->not->toContain($freshSubmitted->id);

    // Also test buildExceptionItems aggregation
    $items = $this->catalog->buildExceptionItems(Need::query()->where('need_group_id', $this->group->id), $this->group, 4, [], $this->now);
    $e5Item = collect($items)->firstWhere('code', 'E5');
    expect($e5Item['count'])->toBeGreaterThanOrEqual(1);
    expect(collect($e5Item['needs'])->pluck('id')->all())->toContain($idleSubmitted->id);
});

test('E6 detects modern submitted proposals missing mandatory linkages', function () {
    $unlinkedSubmitted = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => Need::STATUS_SUBMITTED,
    ]);

    $linkedSubmitted = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => Need::STATUS_SUBMITTED,
    ]);
    NeedAttachment::factory()->create(['need_id' => $linkedSubmitted->id]);
    $linkedSubmitted->sasarans()->attach(Sasaran::factory()->create()->id);
    $linkedSubmitted->indicators()->attach(Indicator::factory()->create()->id);
    $linkedSubmitted->kpiIndicators()->attach(KpiIndicator::factory()->create()->id);
    $linkedSubmitted->strategicServicePlans()->attach(StrategicServicePlan::factory()->create()->id);

    $query = Need::query();
    $this->catalog->applyAttentionScope($query, ['E6'], $this->now);

    $ids = $query->pluck('id')->all();
    expect($ids)->toContain($unlinkedSubmitted->id)
        ->and($ids)->not->toContain($linkedSubmitted->id);

    // Also test buildExceptionItems aggregation
    $items = $this->catalog->buildExceptionItems(Need::query()->where('need_group_id', $this->group->id), $this->group, 4, [], $this->now);
    $e6Item = collect($items)->firstWhere('code', 'E6');
    expect($e6Item['count'])->toBeGreaterThanOrEqual(1);
    expect(collect($e6Item['needs'])->pluck('id')->all())->toContain($unlinkedSubmitted->id);
});

test('proposal mutations immediately invalidate dashboard cache version and payload', function () {
    $statsAction = app(GetNeedDashboardStatsAction::class);

    // 1. Initial dashboard payload populates cache
    $initialPayload = $statsAction->getDashboardPayload($this->group->id, $this->admin);
    expect($initialPayload)->not->toBeEmpty();
    $initialTotal = $initialPayload['stats']['total_needs'] ?? 0;

    // 2. Create a need: NeedObserver fires created -> bustDashboardCache
    $newNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => Need::STATUS_SUBMITTED,
        'total_price' => 5000000,
    ]);

    $payloadAfterCreate = $statsAction->getDashboardPayload($this->group->id, $this->admin);
    expect($payloadAfterCreate['stats']['total_needs'])->toBe($initialTotal + 1);

    // 3. Update the need: NeedObserver fires updated -> bustDashboardCache
    $newNeed->update([
        'total_price' => 10000000,
    ]);

    $payloadAfterUpdate = $statsAction->getDashboardPayload($this->group->id, $this->admin);
    expect((float) $payloadAfterUpdate['stats']['total_budget'])->toBe((float) $payloadAfterCreate['stats']['total_budget'] + 5000000);

    // 4. Delete the need: NeedObserver fires deleted -> bustDashboardCache
    $newNeed->delete();

    $payloadAfterDelete = $statsAction->getDashboardPayload($this->group->id, $this->admin);
    expect($payloadAfterDelete['stats']['total_needs'])->toBe($initialTotal);

    // 5. Restore the need: NeedObserver fires restored -> bustDashboardCache
    $newNeed->restore();

    $payloadAfterRestore = $statsAction->getDashboardPayload($this->group->id, $this->admin);
    expect($payloadAfterRestore['stats']['total_needs'])->toBe($initialTotal + 1);
});
