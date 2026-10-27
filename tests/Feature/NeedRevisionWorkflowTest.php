<?php

declare(strict_types=1);

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

    $this->orgUnit = OrganizationalUnit::factory()->create(['name' => 'Bidang Pelayanan Medik']);

    $this->staffUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->staffUser->assignRole(UserRole::Staff->value);

    $this->directorUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->directorUser->assignRole(UserRole::Director->value);

    $this->needType = NeedType::factory()->create(['is_active' => true]);

    $this->closedGroup = NeedGroup::factory()->create([
        'is_active' => true,
        'submission_start_at' => now()->subDays(10),
        'submission_end_at' => now()->subDays(2),
    ]);
});

describe('Revision Lock Lifecycle Transitions', function () {
    it('sets is_locked to false and clears lock fields when revisionByDirector is called without extension config', function () {
        config(['planning.revision_extension_days' => null]);

        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'status' => Need::STATUS_SUBMITTED,
            'is_locked' => true,
            'lock_reason' => NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW,
        ]);

        $lifecycle = app(NeedLockLifecycle::class);
        $result = $lifecycle->revisionByDirector($need, 'Please revise volume calculation.', $this->directorUser);

        expect($result->status)->toBe(Need::STATUS_REVISION)
            ->and($result->is_locked)->toBeFalse()
            ->and($result->unlocked_until)->toBeNull()
            ->and($result->lock_reason)->toBeNull()
            ->and($result->notes)->toBe('Please revise volume calculation.');
    });

    it('sets unlocked_until when planning.revision_extension_days is configured', function () {
        config(['planning.revision_extension_days' => 5]);

        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'status' => Need::STATUS_SUBMITTED,
            'is_locked' => true,
            'lock_reason' => NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW,
        ]);

        $lifecycle = app(NeedLockLifecycle::class);
        $result = $lifecycle->revisionByDirector($need, 'Extension granted for 5 days.', $this->directorUser);

        expect($result->status)->toBe(Need::STATUS_REVISION)
            ->and($result->is_locked)->toBeNull()
            ->and($result->unlocked_until)->not->toBeNull()
            ->and($result->unlocked_until->isFuture())->toBeTrue();
    });
});

describe('Lock Status Resolution for Revision Outside Submission Window', function () {
    it('evaluates is_locked to false for revision proposals with explicit unlock override on closed group', function () {
        expect($this->closedGroup->isOpenForSubmission())->toBeFalse();

        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'status' => Need::STATUS_REVISION,
            'is_locked' => false,
            'unlocked_until' => null,
            'notes' => 'Revision requested',
        ]);

        expect($need->isLocked($this->staffUser))->toBeFalse();
        expect($need->resolveLockStatus($this->staffUser)['is_locked'])->toBeFalse();
    });

    it('evaluates is_locked to true when revision proposal is explicitly locked', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'status' => Need::STATUS_REVISION,
            'is_locked' => true,
            'lock_reason' => 'Explicitly locked by planner',
        ]);

        expect($need->isLocked($this->staffUser))->toBeTrue();
    });
});

describe('Policy Authorization for Revision Proposals', function () {
    it('authorizes update and submit for originating unit staff on unlocked revision proposal when group is closed', function () {
        expect($this->closedGroup->isOpenForSubmission())->toBeFalse();

        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'status' => Need::STATUS_REVISION,
            'is_locked' => false,
        ]);

        expect($this->staffUser->can('update', $need))->toBeTrue();
        expect($this->staffUser->can('submit', $need))->toBeTrue();
    });

    it('denies update and submit when revision proposal is locked', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'status' => Need::STATUS_REVISION,
            'is_locked' => true,
            'lock_reason' => 'Manually locked',
        ]);

        expect($this->staffUser->can('update', $need))->toBeFalse();
        expect($this->staffUser->can('submit', $need))->toBeFalse();
    });
});

describe('End-to-End Revision Workflow Outside Submission Window', function () {
    it('allows originating unit staff to edit a revised proposal via PATCH /needs/{need} when group window is closed', function () {
        expect($this->closedGroup->isOpenForSubmission())->toBeFalse();

        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'is_locked' => true,
            'title' => 'Initial Title',
            'volume' => 10,
            'unit' => 'unit',
            'unit_price' => 50000,
            'total_price' => 500000,
            'urgency' => Urgency::High->value,
            'impact' => Impact::High->value,
        ]);

        // Director returns proposal for revision
        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_REVISION,
                'notes' => 'Tolong sesuaikan volume kebutuhan menjadi 8.',
            ])
            ->assertSessionHasNoErrors();

        $need->refresh();
        expect($need->status)->toBe(Need::STATUS_REVISION)
            ->and($need->is_locked)->toBeFalse();

        // Staff from originating unit edits proposal despite closed submission window
        $response = $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), [
                'need_group_id' => $this->closedGroup->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Revised Title',
                'volume' => 8,
                'unit' => 'unit',
                'unit_price' => 50000,
                'total_price' => 400000,
                'urgency' => Urgency::High->value,
                'impact' => Impact::High->value,
            ]);

        $response->assertRedirect();
        $need->refresh();

        expect($need->title)->toBe('Revised Title')
            ->and((float) $need->volume)->toBe(8.0)
            ->and((float) $need->total_price)->toBe(400000.0)
            ->and($need->status)->toBe(Need::STATUS_REVISION)
            ->and($need->is_locked)->toBeFalse();
    });

    it('allows submitting unit staff to call POST /needs/{need}/submit on revised proposal after window closed, locking it', function () {
        expect($this->closedGroup->isOpenForSubmission())->toBeFalse();

        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_REVISION,
            'is_locked' => false,
            'notes' => 'Revision notes',
        ]);

        $response = $this->actingAs($this->staffUser)
            ->post(route('needs.submit', $need));

        $response->assertRedirect();
        $need->refresh();

        expect($need->status)->toBe(Need::STATUS_SUBMITTED)
            ->and($need->is_locked)->toBeTrue()
            ->and($need->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW)
            ->and($need->unlocked_until)->toBeNull();

        // Further edits are now locked
        expect($this->staffUser->can('update', $need))->toBeFalse();
    });

    it('atomically saves and resubmits proposal with submit: true when window is closed, locking it against further edits', function () {
        expect($this->closedGroup->isOpenForSubmission())->toBeFalse();

        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_REVISION,
            'is_locked' => false,
            'title' => 'Before Save and Submit',
            'volume' => 10,
            'unit' => 'unit',
            'unit_price' => 50000,
            'total_price' => 500000,
            'urgency' => Urgency::High->value,
            'impact' => Impact::High->value,
        ]);

        $response = $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), [
                'need_group_id' => $this->closedGroup->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'After Save and Submit',
                'volume' => 7,
                'unit' => 'unit',
                'unit_price' => 50000,
                'total_price' => 350000,
                'urgency' => Urgency::High->value,
                'impact' => Impact::High->value,
                'submit' => true,
            ]);

        $response->assertRedirect();
        $need->refresh();

        expect($need->title)->toBe('After Save and Submit')
            ->and((float) $need->volume)->toBe(7.0)
            ->and($need->status)->toBe(Need::STATUS_SUBMITTED)
            ->and($need->is_locked)->toBeTrue()
            ->and($need->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW)
            ->and($need->unlocked_until)->toBeNull();

        // Further edits are blocked
        $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), [
                'need_group_id' => $this->closedGroup->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Should Be Blocked',
                'volume' => 1,
                'unit' => 'unit',
                'unit_price' => 1000,
                'total_price' => 1000,
                'urgency' => Urgency::Low->value,
                'impact' => Impact::Low->value,
            ])
            ->assertForbidden();
    });
});
