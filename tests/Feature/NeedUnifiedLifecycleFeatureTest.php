<?php

declare(strict_types=1);

use App\Actions\Need\NeedLockLifecycle;
use App\Enums\Impact;
use App\Enums\Urgency;
use App\Enums\UserRole;
use App\Exports\NeedExport;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->orgUnit = OrganizationalUnit::factory()->create(['name' => 'Teknologi Informasi']);
    $this->otherOrgUnit = OrganizationalUnit::factory()->create(['name' => 'Keuangan']);

    $this->staffUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->staffUser->assignRole(UserRole::Staff->value);

    $this->plannerUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->plannerUser->assignRole(UserRole::Planner->value);

    $this->directorUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->directorUser->assignRole(UserRole::Director->value);

    $this->superAdminUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->superAdminUser->assignRole(UserRole::SuperAdmin->value);

    $this->needType = NeedType::factory()->create(['is_active' => true]);

    $this->group = NeedGroup::factory()->create([
        'name' => 'Rencana Kebutuhan 2026',
        'year' => 2026,
        'is_active' => true,
        'submission_start_at' => now()->subDays(5),
        'submission_end_at' => now()->addDays(10),
    ]);
});

describe('Status and Recommendation Filter Queries', function () {
    it('filters accurately by any single unified status via HTTP query', function () {
        $draft = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_DRAFT,
            'title' => 'Proposal Draft 1',
        ]);

        $submitted = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'title' => 'Proposal Submitted 1',
        ]);

        $approved = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_APPROVED,
            'approved_by_director_at' => now(),
            'title' => 'Proposal Approved 1',
        ]);

        $rejected = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_REJECTED,
            'title' => 'Proposal Rejected 1',
        ]);

        $revision = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_REVISION,
            'notes' => 'Perbaiki RAB',
            'title' => 'Proposal Revision 1',
        ]);

        foreach (Need::STATUSES as $status) {
            $response = $this->actingAs($this->superAdminUser)
                ->get(route('needs.index', [
                    'need_group_id' => $this->group->id,
                    'status' => [$status],
                ]));

            $response->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('need/needs/index')
                    ->has('needs.data', 1)
                    ->where('needs.data.0.status', $status)
                );
        }
    });

    it('filters accurately by combination of unified statuses via HTTP query', function () {
        Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_DRAFT,
            'title' => 'Draft Need',
        ]);

        Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'title' => 'Submitted Need',
        ]);

        Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_APPROVED,
            'approved_by_director_at' => now(),
            'title' => 'Approved Need',
        ]);

        // Filter combination: draft + submitted
        $response = $this->actingAs($this->superAdminUser)
            ->get(route('needs.index', [
                'need_group_id' => $this->group->id,
                'status' => [Need::STATUS_DRAFT, Need::STATUS_SUBMITTED],
            ]));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/index')
                ->has('needs.data', 2)
            );

        // Filter combination: approved + rejected (0 rejected exists)
        $response = $this->actingAs($this->superAdminUser)
            ->get(route('needs.index', [
                'need_group_id' => $this->group->id,
                'status' => [Need::STATUS_APPROVED, Need::STATUS_REJECTED],
            ]));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/index')
                ->has('needs.data', 1)
                ->where('needs.data.0.status', Need::STATUS_APPROVED)
            );
    });

    it('filters accurately by next-cycle recommendation flag via HTTP query', function () {
        Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_APPROVED,
            'is_recommended_for_next_cycle' => true,
            'recommended_volume' => 4,
            'title' => 'Recommended Proposal',
        ]);

        Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_APPROVED,
            'is_recommended_for_next_cycle' => false,
            'recommended_volume' => null,
            'title' => 'Standard Approved Proposal',
        ]);

        // Filter recommended = 1
        $response = $this->actingAs($this->superAdminUser)
            ->get(route('needs.index', [
                'need_group_id' => $this->group->id,
                'is_recommended_for_next_cycle' => ['1'],
            ]));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/index')
                ->has('needs.data', 1)
                ->where('needs.data.0.title', 'Recommended Proposal')
                ->where('needs.data.0.is_recommended_for_next_cycle', true)
            );

        // Filter recommended = 0
        $response = $this->actingAs($this->superAdminUser)
            ->get(route('needs.index', [
                'need_group_id' => $this->group->id,
                'is_recommended_for_next_cycle' => ['0'],
            ]));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/index')
                ->has('needs.data', 1)
                ->where('needs.data.0.title', 'Standard Approved Proposal')
                ->where('needs.data.0.is_recommended_for_next_cycle', false)
            );
    });
    it('filters accurately by combined status and next-cycle recommendation flag via HTTP query', function () {
        // Approved with recommendation
        Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_APPROVED,
            'approved_by_director_at' => now(),
            'is_recommended_for_next_cycle' => true,
            'title' => 'Approved Recommended',
        ]);

        // Approved without recommendation
        Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_APPROVED,
            'approved_by_director_at' => now(),
            'is_recommended_for_next_cycle' => false,
            'title' => 'Approved Not Recommended',
        ]);

        // Rejected with recommendation
        Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_REJECTED,
            'is_recommended_for_next_cycle' => true,
            'title' => 'Rejected Recommended',
        ]);

        // Filter: status = approved AND is_recommended_for_next_cycle = 1
        $response = $this->actingAs($this->superAdminUser)
            ->get(route('needs.index', [
                'need_group_id' => $this->group->id,
                'status' => [Need::STATUS_APPROVED],
                'is_recommended_for_next_cycle' => '1',
            ]));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/index')
                ->has('needs.data', 1)
                ->where('needs.data.0.title', 'Approved Recommended')
            );

        // Filter: status = [approved, rejected] AND is_recommended_for_next_cycle = 1
        $response = $this->actingAs($this->superAdminUser)
            ->get(route('needs.index', [
                'need_group_id' => $this->group->id,
                'status' => [Need::STATUS_APPROVED, Need::STATUS_REJECTED],
                'is_recommended_for_next_cycle' => ['1'],
            ]));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/index')
                ->has('needs.data', 2)
            );
    });

    it('applies status and recommendation filters to Excel export', function () {
        Excel::fake();

        Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_APPROVED,
            'is_recommended_for_next_cycle' => true,
        ]);

        $response = $this->actingAs($this->superAdminUser)
            ->get(route('needs.export', [
                'need_group_id' => $this->group->id,
                'status' => [Need::STATUS_APPROVED],
                'is_recommended_for_next_cycle' => '1',
            ]));

        $response->assertOk();
        Excel::assertDownloaded('daftar-usulan-kebutuhan.xlsx', function (NeedExport $export) {
            return true;
        });
    });
});

describe('Full Lifecycle Transitions, Resubmission, and Rollover', function () {
    it('verifies drafting, direct submission, and explicit submission transition with read-only locking enforcement', function () {
        // 1. Drafting: create proposal without submit flag
        $createPayload = [
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Draft Proposal',
            'volume' => 10,
            'unit' => 'unit',
            'unit_price' => 1000000,
            'total_price' => 10000000,
            'urgency' => Urgency::Medium->value,
            'impact' => Impact::Medium->value,
            'status' => Need::STATUS_DRAFT,
        ];

        $this->actingAs($this->staffUser)
            ->post(route('needs.store'), $createPayload)
            ->assertRedirect();

        $draft = Need::where('title', 'Draft Proposal')->firstOrFail();
        expect($draft->status)->toBe(Need::STATUS_DRAFT)
            ->and($draft->is_locked)->toBeNull()
            ->and($draft->isLocked($this->staffUser))->toBeFalse();

        // 2. Explicit submission: POST needs/{need}/submit
        $this->actingAs($this->staffUser)
            ->post(route('needs.submit', $draft))
            ->assertRedirect();

        $draft->refresh();
        expect($draft->status)->toBe(Need::STATUS_SUBMITTED)
            ->and($draft->is_locked)->toBeTrue()
            ->and($draft->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW);

        // Submitter cannot edit submitted proposal
        $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $draft), array_merge($createPayload, ['title' => 'Hacked Title']))
            ->assertForbidden();

        // Submitter cannot delete submitted proposal
        $this->actingAs($this->staffUser)
            ->delete(route('needs.destroy', $draft))
            ->assertForbidden();

        // 3. Direct submission: create with submit => true
        $directPayload = [
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Direct Submitted Proposal',
            'volume' => 5,
            'unit' => 'unit',
            'unit_price' => 2000000,
            'total_price' => 10000000,
            'urgency' => Urgency::High->value,
            'impact' => Impact::High->value,
            'submit' => true,
        ];

        $this->actingAs($this->staffUser)
            ->post(route('needs.store'), $directPayload)
            ->assertRedirect();

        $direct = Need::where('title', 'Direct Submitted Proposal')->firstOrFail();
        expect($direct->status)->toBe(Need::STATUS_SUBMITTED)
            ->and($direct->is_locked)->toBeTrue()
            ->and($direct->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW);
    });

    it('verifies full approval, partial approval with residual recommendation, rejection with rollover recommendation, and revision requests', function () {
        // 1. Full approval
        $needFull = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 10,
            'unit_price' => 500000,
            'total_price' => 5000000,
            'is_locked' => true,
        ]);

        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $needFull), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 10,
                'approved_unit_price' => 500000,
                'notes' => 'Disetujui penuh.',
                'is_recommended_for_next_cycle' => false,
            ])
            ->assertSessionHasNoErrors();

        $needFull->refresh();
        expect($needFull->status)->toBe(Need::STATUS_APPROVED)
            ->and((float) $needFull->approved_volume)->toBe(10.0)
            ->and((float) $needFull->approved_unit_price)->toBe(500000.0)
            ->and((float) $needFull->approved_total_price)->toBe(5000000.0)
            ->and($needFull->is_recommended_for_next_cycle)->toBeFalse()
            ->and($needFull->recommended_volume)->toBeNull()
            ->and($needFull->is_locked)->toBeTrue();

        // 2. Partial approval with residual recommendation
        $needPartial = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 10,
            'unit_price' => 500000,
            'total_price' => 5000000,
            'is_locked' => true,
        ]);

        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $needPartial), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 6,
                'approved_unit_price' => 450000,
                'notes' => 'Disetujui 6 unit, sisa 4 unit dialihkan ke tahun berikutnya.',
                'is_recommended_for_next_cycle' => true,
            ])
            ->assertSessionHasNoErrors();

        $needPartial->refresh();
        expect($needPartial->status)->toBe(Need::STATUS_APPROVED)
            ->and((float) $needPartial->approved_volume)->toBe(6.0)
            ->and((float) $needPartial->approved_unit_price)->toBe(450000.0)
            ->and((float) $needPartial->approved_total_price)->toBe(2700000.0)
            ->and($needPartial->is_recommended_for_next_cycle)->toBeTrue()
            ->and((float) $needPartial->recommended_volume)->toBe(4.0)
            ->and($needPartial->is_locked)->toBeTrue();

        // 3. Rejection with rollover recommendation
        $needRejected = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 8,
            'unit_price' => 1000000,
            'total_price' => 8000000,
            'is_locked' => true,
        ]);

        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $needRejected), [
                'decision' => Need::STATUS_REJECTED,
                'notes' => 'Plafon anggaran habis, prioritaskan di siklus berikutnya.',
                'is_recommended_for_next_cycle' => true,
            ])
            ->assertSessionHasNoErrors();

        $needRejected->refresh();
        expect($needRejected->status)->toBe(Need::STATUS_REJECTED)
            ->and($needRejected->approved_by_director_at)->toBeNull()
            ->and($needRejected->approved_volume)->toBeNull()
            ->and($needRejected->approved_unit_price)->toBeNull()
            ->and($needRejected->approved_total_price)->toBeNull()
            ->and($needRejected->is_recommended_for_next_cycle)->toBeTrue()
            ->and((float) $needRejected->recommended_volume)->toBe(8.0)
            ->and($needRejected->is_locked)->toBeTrue();

        // 4. Revision request
        $needRevision = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 5,
            'unit_price' => 200000,
            'total_price' => 1000000,
            'is_locked' => true,
        ]);

        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $needRevision), [
                'decision' => Need::STATUS_REVISION,
                'notes' => 'Tolong lampirkan perbandingan harga pasar.',
            ])
            ->assertSessionHasNoErrors();

        $needRevision->refresh();
        expect($needRevision->status)->toBe(Need::STATUS_REVISION)
            ->and($needRevision->approved_by_director_at)->toBeNull()
            ->and($needRevision->notes)->toBe('Tolong lampirkan perbandingan harga pasar.')
            ->and($needRevision->is_recommended_for_next_cycle)->toBeFalse()
            ->and($needRevision->recommended_volume)->toBeNull()
            ->and($needRevision->is_locked)->toBeNull()
            ->and($needRevision->isLocked($this->staffUser))->toBeFalse();
    });

    it('verifies that revised proposals can be edited and resubmitted back to submitted status', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_REVISION,
            'title' => 'Original Revised Title',
            'volume' => 5,
            'unit_price' => 100000,
            'total_price' => 500000,
            'notes' => 'Perbaiki volume menjadi 3 unit.',
            'is_locked' => null,
        ]);

        // 1. Submitter can edit the proposal in revision status
        $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), [
                'need_group_id' => $this->group->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Amended Revised Title',
                'volume' => 3,
                'unit' => 'unit',
                'unit_price' => 100000,
                'total_price' => 300000,
                'urgency' => Urgency::Medium->value,
                'impact' => Impact::Medium->value,
            ])
            ->assertRedirect();

        $need->refresh();
        expect($need->title)->toBe('Amended Revised Title')
            ->and((float) $need->volume)->toBe(3.0)
            ->and((float) $need->total_price)->toBe(300000.0)
            ->and($need->status)->toBe(Need::STATUS_REVISION);

        // 2. Submitter resubmits proposal
        $this->actingAs($this->staffUser)
            ->post(route('needs.submit', $need))
            ->assertRedirect();

        $need->refresh();
        expect($need->status)->toBe(Need::STATUS_SUBMITTED)
            ->and($need->is_locked)->toBeTrue()
            ->and($need->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW);

        // 3. Re-locking prevents further edits by submitter
        $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), [
                'need_group_id' => $this->group->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Attempted Edit After Resubmission',
                'volume' => 3,
                'unit' => 'unit',
                'unit_price' => 100000,
                'total_price' => 300000,
                'urgency' => Urgency::Medium->value,
                'impact' => Impact::Medium->value,
            ])
            ->assertForbidden();
    });

    it('verifies that partially approved proposals with residual recommendations appear in candidate rollover queries and clone accurately', function () {
        $targetGroup = NeedGroup::factory()->create([
            'name' => 'Rencana Kebutuhan 2027',
            'year' => 2027,
            'is_active' => true,
        ]);

        $partiallyApproved = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_APPROVED,
            'approved_by_director_at' => now(),
            'volume' => 10,
            'unit_price' => 50000,
            'total_price' => 500000,
            'approved_volume' => 6,
            'approved_unit_price' => 50000,
            'approved_total_price' => 300000,
            'is_recommended_for_next_cycle' => true,
            'recommended_volume' => 4,
            'is_locked' => true,
        ]);

        // 1. Candidate query includes partially approved with residual recommendation
        $response = $this->actingAs($this->superAdminUser)
            ->getJson(route('needs.unapproved-candidates', [
                'target_need_group_id' => $targetGroup->id,
            ]));

        $response->assertOk();
        $candidateIds = collect($response->json('data'))->pluck('id')->all();
        expect($candidateIds)->toContain($partiallyApproved->id);

        // 2. Clone via rollover endpoint
        $rolloverResponse = $this->actingAs($this->superAdminUser)
            ->post(route('need-groups.rollover', $targetGroup), [
                'need_ids' => [$partiallyApproved->id],
            ]);
        $rolloverResponse->assertRedirect();

        $cloned = Need::where('need_group_id', $targetGroup->id)
            ->where('source_need_id', $partiallyApproved->id)
            ->firstOrFail();

        expect((float) $cloned->volume)->toBe(4.0)
            ->and((float) $cloned->unit_price)->toBe(50000.0)
            ->and((float) $cloned->total_price)->toBe(200000.0)
            ->and($cloned->status)->toBe(Need::STATUS_DRAFT)
            ->and($cloned->approved_by_director_at)->toBeNull()
            ->and($cloned->approved_volume)->toBeNull()
            ->and($cloned->approved_unit_price)->toBeNull()
            ->and($cloned->approved_total_price)->toBeNull()
            ->and($cloned->is_recommended_for_next_cycle)->toBeFalse()
            ->and($cloned->recommended_volume)->toBeNull()
            ->and($cloned->is_locked)->toBeNull();
    });

    it('rejects invalid state transitions such as submitting approved or rejected proposals', function () {
        $approved = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_APPROVED,
            'approved_by_director_at' => now(),
        ]);

        $this->actingAs($this->staffUser)
            ->post(route('needs.submit', $approved))
            ->assertSessionHasErrors('status');

        expect($approved->fresh()->status)->toBe(Need::STATUS_APPROVED);

        $rejected = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_REJECTED,
        ]);

        $this->actingAs($this->staffUser)
            ->post(route('needs.submit', $rejected))
            ->assertSessionHasErrors('status');

        expect($rejected->fresh()->status)->toBe(Need::STATUS_REJECTED);
    });

    it('strictly forbids unauthorized users from executing director reviews', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 5,
            'unit_price' => 100000,
            'total_price' => 500000,
        ]);

        // Standard staff cannot review
        $this->actingAs($this->staffUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 5,
                'approved_unit_price' => 100000,
            ])
            ->assertForbidden();

        // User from another org unit without director role cannot review
        $otherStaff = User::factory()->create([
            'organizational_unit_id' => $this->otherOrgUnit->id,
        ]);
        $otherStaff->assignRole(UserRole::Staff->value);

        $this->actingAs($otherStaff)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 5,
                'approved_unit_price' => 100000,
            ])
            ->assertForbidden();

        expect($need->fresh()->status)->toBe(Need::STATUS_SUBMITTED);
    });
});
