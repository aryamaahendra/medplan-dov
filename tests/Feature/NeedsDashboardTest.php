<?php

use App\Actions\Need\GetNeedDashboardStatsAction;
use App\Enums\UserRole;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->group = NeedGroup::factory()->create([
        'name' => 'Usulan 2026',
        'year' => 2026,
        'is_active' => true,
    ]);

    $this->prevGroup = NeedGroup::factory()->create([
        'name' => 'Usulan 2025',
        'year' => 2025,
        'is_active' => false,
    ]);

    $this->unitA = OrganizationalUnit::factory()->create(['name' => 'Unit Pelayanan A']);
    $this->unitB = OrganizationalUnit::factory()->create(['name' => 'Unit Pelayanan B']);

    $this->superAdmin = User::factory()->create(['organizational_unit_id' => $this->unitA->id]);
    $this->superAdmin->assignRole(UserRole::SuperAdmin->value);

    $this->director = User::factory()->create(['organizational_unit_id' => $this->unitA->id]);
    $this->director->assignRole(UserRole::Director->value);

    $this->staffA = User::factory()->create(['organizational_unit_id' => $this->unitA->id]);
    $this->staffA->assignRole(UserRole::Staff->value);

    $this->staffB = User::factory()->create(['organizational_unit_id' => $this->unitB->id]);
    $this->staffB->assignRole(UserRole::Staff->value);
});

test('stage-based aggregation correctly categorizes under_review vs approved vs draft', function () {
    // 1. Draft
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 1000,
        'approved_by_director_at' => null,
    ]);

    // 2. Under Review: status is approved, but approved_by_director_at is null
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'approved',
        'total_price' => 2000,
        'approved_by_director_at' => null,
    ]);

    // 3. Approved: approved_by_director_at is set
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'approved',
        'total_price' => 3000,
        'approved_by_director_at' => now(),
    ]);

    // 4. Rejected
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'rejected',
        'total_price' => 4000,
        'approved_by_director_at' => null,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    expect($payload['stats']['total_needs'])->toBe(4)
        ->and($payload['stats']['active_needs_count'])->toBe(3)
        ->and($payload['stats']['total_budget'])->toBe(6000.0)
        ->and($payload['stats']['draft_count'])->toBe(1)
        ->and($payload['stats']['draft_budget'])->toBe(1000.0)
        ->and($payload['stats']['awaiting_director'])->toBe(1)
        ->and($payload['stats']['awaiting_director_budget'])->toBe(2000.0)
        ->and($payload['stats']['approved_by_director'])->toBe(1)
        ->and($payload['stats']['approved_budget'])->toBe(3000.0)
        ->and($payload['stats']['rejected_count'])->toBe(1)
        ->and($payload['stats']['rejected_budget'])->toBe(4000.0);
});

test('role scope restricts dashboard stats for staff to their own unit', function () {
    // Unit A needs
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 1000,
    ]);

    // Unit B needs
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitB->id,
        'status' => 'draft',
        'total_price' => 5000,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);

    // Super admin sees both
    $adminPayload = $action->getDashboardPayload($this->group->id, $this->superAdmin);
    expect($adminPayload['stats']['total_needs'])->toBe(2)
        ->and($adminPayload['stats']['total_budget'])->toBe(6000.0);

    // Staff A only sees unit A
    $staffAPayload = $action->getDashboardPayload($this->group->id, $this->staffA);
    expect($staffAPayload['stats']['total_needs'])->toBe(1)
        ->and($staffAPayload['stats']['total_budget'])->toBe(1000.0)
        ->and($staffAPayload['needsByUnit'])->toHaveCount(1)
        ->and($staffAPayload['needsByUnit'][0]['unit_id'])->toBe($this->unitA->id);
});

test('needs index controller supplies deferred dashboardPayload prop', function () {
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'total_price' => 1500,
    ]);

    $response = $this->actingAs($this->superAdmin)->get(route('needs.index', [
        'need_group_id' => $this->group->id,
    ]));

    $response->assertOk();
    $version = $response->inertiaPage()['version'] ?? '';

    // Verify deferred loading of dashboard props
    $partialResponse = $this->actingAs($this->superAdmin)->get(route('needs.index', [
        'need_group_id' => $this->group->id,
    ]), [
        'X-Inertia' => 'true',
        'X-Inertia-Version' => (string) $version,
        'X-Inertia-Partial-Component' => 'need/needs/index',
        'X-Inertia-Partial-Data' => 'dashboardPayload',
    ]);

    $partialResponse->assertOk();
    $partialResponse->assertJson(fn ($json) => $json
        ->has('props.dashboardPayload.stats')
        ->has('props.dashboardPayload.matrix')
        ->has('props.dashboardPayload.stageDistribution')
        ->has('props.dashboardPayload.allUnitProgress')
        ->has('props.dashboardPayload.dataReadiness')
        ->has('props.dashboardPayload.exceptions')
        ->etc()
    );
});

test('operations payload supplies full variant B command center data', function () {
    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'checklist_percentage' => 90,
        'total_price' => 5000,
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    expect($payload)->toHaveKey('operations')
        ->and($payload['operations'])->toHaveKeys([
            'meta',
            'stage_tiles',
            'ready_for_verification',
            'exceptions',
            'lock_monitor',
            'aging',
            'unit_progress',
        ])
        ->and($payload['operations']['meta']['scope_label'])->toBe('Seluruh Rumah Sakit')
        ->and($payload['operations']['stage_tiles']['draft']['holder'])->toBe('Unit Kerja')
        ->and($payload['operations']['stage_tiles']['under_review']['holder'])->toBe('Tim Perencana / Direktur')
        ->and($payload['operations']['stage_tiles']['approved']['holder'])->toBe('Selesai')
        ->and($payload['operations']['stage_tiles']['rejected']['holder'])->toBe('Unit Kerja (Revisi)');
});

test('operations exception catalog accurately detects idle needs and attention filter works', function () {
    // Idle draft (updated 10 days ago) -> E2
    $staleDraft = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'updated_at' => now()->subDays(10),
    ]);

    // Fresh draft -> not E2
    $freshDraft = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unitA->id,
        'status' => 'draft',
        'updated_at' => now()->subDay(),
    ]);

    $action = app(GetNeedDashboardStatsAction::class);
    $payload = $action->getDashboardPayload($this->group->id, $this->superAdmin);

    $e2Item = collect($payload['operations']['exceptions'])->firstWhere('code', 'E2');
    expect($e2Item)->not->toBeNull()
        ->and($e2Item['count'])->toBeGreaterThanOrEqual(1);

    // Test click-through attention filter via HTTP request
    $response = $this->actingAs($this->superAdmin)->get(route('needs.index', [
        'need_group_id' => $this->group->id,
        'attention' => ['E2'],
    ]));

    $response->assertOk();
    $needsData = $response->inertiaPage()['props']['needs']['data'] ?? [];
    $filteredIds = collect($needsData)->pluck('id')->all();

    expect($filteredIds)->toContain($staleDraft->id)
        ->and($filteredIds)->not->toContain($freshDraft->id);
});
