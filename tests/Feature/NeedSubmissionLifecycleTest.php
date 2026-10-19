<?php

use App\Actions\Need\NeedLockLifecycle;
use App\Enums\Impact;
use App\Enums\Urgency;
use App\Enums\UserRole;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->orgUnit = OrganizationalUnit::factory()->create();
    $this->otherOrgUnit = OrganizationalUnit::factory()->create();

    $this->staffUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->staffUser->assignRole(UserRole::Staff->value);

    $this->otherStaffUser = User::factory()->create([
        'organizational_unit_id' => $this->otherOrgUnit->id,
    ]);
    $this->otherStaffUser->assignRole(UserRole::Staff->value);

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

    $this->openGroup = NeedGroup::factory()->create([
        'is_active' => true,
        'submission_start_at' => now()->subDays(5),
        'submission_end_at' => now()->addDays(5),
    ]);
});

describe('Dedicated Submission Endpoint', function () {
    it('transitions draft proposal to submitted and locks it for executive review', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_DRAFT,
            'is_locked' => false,
        ]);

        $response = $this->actingAs($this->staffUser)
            ->post(route('needs.submit', $need));

        $response->assertRedirect();
        $need->refresh();

        expect($need->status)->toBe(Need::STATUS_SUBMITTED);
        expect($need->is_locked)->toBeTrue();
        expect($need->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW);
        expect($need->locked_by_user_id)->toBe($this->staffUser->id);
        expect($need->locked_at)->not->toBeNull();
    });

    it('transitions revision proposal to submitted and locks it for executive review', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_REVISION,
            'is_locked' => false,
            'notes' => 'Tolong perbaiki spesifikasi teknis.',
        ]);

        $response = $this->actingAs($this->staffUser)
            ->post(route('needs.submit', $need));

        $response->assertRedirect();
        $need->refresh();

        expect($need->status)->toBe(Need::STATUS_SUBMITTED);
        expect($need->is_locked)->toBeTrue();
        expect($need->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW);
    });

    it('validates that proposal is in draft or revision status before submitting', function () {
        $approvedNeed = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_APPROVED,
            'approved_by_director_at' => now(),
        ]);

        $response = $this->actingAs($this->staffUser)
            ->post(route('needs.submit', $approvedNeed));

        $response->assertSessionHasErrors('status');
        expect($approvedNeed->fresh()->status)->toBe(Need::STATUS_APPROVED);
    });
});

describe('Direct Submission Flag on Create & Update', function () {
    it('atomically creates and submits proposal when submit flag is present in payload', function () {
        $payload = [
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Atomic Save and Submit Proposal',
            'volume' => 5,
            'unit' => 'unit',
            'unit_price' => 2000000,
            'total_price' => 10000000,
            'urgency' => Urgency::High->value,
            'impact' => Impact::High->value,
            'submit' => true,
        ];

        $response = $this->actingAs($this->staffUser)
            ->post(route('needs.store'), $payload);

        $response->assertRedirect();

        $need = Need::where('title', 'Atomic Save and Submit Proposal')->first();
        expect($need)->not->toBeNull();
        expect($need->status)->toBe(Need::STATUS_SUBMITTED);
        expect($need->is_locked)->toBeTrue();
        expect($need->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW);
    });

    it('atomically updates and submits proposal when submit flag is present in payload', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_DRAFT,
            'is_locked' => false,
            'title' => 'Draft Title',
        ]);

        $payload = [
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Updated and Submitted Title',
            'volume' => 3,
            'unit' => 'unit',
            'unit_price' => 5000000,
            'total_price' => 15000000,
            'urgency' => Urgency::High->value,
            'impact' => Impact::Medium->value,
            'submit' => true,
        ];

        $response = $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), $payload);

        $response->assertRedirect();
        $need->refresh();

        expect($need->title)->toBe('Updated and Submitted Title');
        expect($need->status)->toBe(Need::STATUS_SUBMITTED);
        expect($need->is_locked)->toBeTrue();
        expect($need->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW);
    });
});

describe('Policy Authorization for Submission', function () {
    it('authorizes submission for members of originating organizational unit', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'status' => Need::STATUS_DRAFT,
        ]);

        expect($this->staffUser->can('submit', $need))->toBeTrue();
    });

    it('authorizes submission for privileged planners and administrators', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->otherOrgUnit->id,
            'status' => Need::STATUS_DRAFT,
        ]);

        expect($this->plannerUser->can('submit', $need))->toBeTrue();
        expect($this->superAdminUser->can('submit', $need))->toBeTrue();
    });

    it('rejects submission for users belonging to a different unit without privileges', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'status' => Need::STATUS_DRAFT,
        ]);

        expect($this->otherStaffUser->can('submit', $need))->toBeFalse();

        $response = $this->actingAs($this->otherStaffUser)
            ->post(route('needs.submit', $need));

        $response->assertForbidden();
    });
});

describe('Read-Only Locking Protection on Submitted Proposals', function () {
    it('rejects update requests from standard submitters while proposal is submitted', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'is_locked' => true,
            'lock_reason' => NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW,
        ]);

        expect($this->staffUser->can('update', $need))->toBeFalse();

        $response = $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), [
                'need_group_id' => $this->openGroup->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Attempted Edit on Submitted Need',
                'volume' => 1,
                'unit' => 'unit',
                'unit_price' => 1000,
                'total_price' => 1000,
                'urgency' => Urgency::Low->value,
                'impact' => Impact::Low->value,
            ]);

        $response->assertForbidden();
    });

    it('rejects delete requests from standard submitters while proposal is submitted', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'is_locked' => true,
            'lock_reason' => NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW,
        ]);

        expect($this->staffUser->can('delete', $need))->toBeFalse();

        $response = $this->actingAs($this->staffUser)
            ->delete(route('needs.destroy', $need));

        $response->assertForbidden();
        expect($need->fresh())->not->toBeNull();
    });
});
