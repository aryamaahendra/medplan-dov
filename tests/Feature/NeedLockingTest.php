<?php

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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->orgUnit = OrganizationalUnit::factory()->create();

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

    $this->openGroup = NeedGroup::factory()->create([
        'is_active' => true,
        'submission_start_at' => now()->subDays(5),
        'submission_end_at' => now()->addDays(5),
    ]);
});

describe('Need isLocked helper', function () {
    it('returns false when need is not locked and group window is open', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => false,
            'approved_by_director_at' => null,
        ]);

        expect($need->isLocked($this->staffUser))->toBeFalse();
        expect($need->isLocked())->toBeFalse();
    });

    it('returns false for super-admin even if locked or director approved', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by_user_id' => $this->plannerUser->id,
            'lock_reason' => 'Manually locked ahead of review',
            'approved_by_director_at' => now(),
        ]);

        expect($need->isLocked($this->superAdminUser))->toBeFalse();
    });

    it('returns true when need has approved_by_director_at set', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'approved_by_director_at' => now(),
        ]);

        expect($need->isLocked($this->staffUser))->toBeTrue();
        expect($need->isLocked())->toBeTrue();
    });

    it('returns true when need is_locked is true', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by_user_id' => $this->plannerUser->id,
            'lock_reason' => 'Frozen for evaluation',
            'approved_by_director_at' => null,
        ]);

        expect($need->isLocked($this->staffUser))->toBeTrue();
        expect($need->isLocked())->toBeTrue();
    });

    it('returns true when group submission window is closed even if is_locked is null', function () {
        $closedGroup = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => now()->subDays(10),
            'submission_end_at' => now()->subDay(),
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => null,
            'approved_by_director_at' => null,
        ]);

        expect($need->isLocked($this->staffUser))->toBeTrue();
    });

    it('returns false when need has an active extension window even if group window is closed', function () {
        $closedGroup = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => now()->subDays(10),
            'submission_end_at' => now()->subDay(),
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'unlocked_until' => now()->addHours(2),
            'approved_by_director_at' => null,
        ]);

        expect($need->isLocked($this->staffUser))->toBeFalse();
        expect($need->isLocked())->toBeFalse();
    });

    it('returns true when need extension window has expired and group window is closed', function () {
        $closedGroup = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => now()->subDays(10),
            'submission_end_at' => now()->subDay(),
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'unlocked_until' => now()->subMinute(),
            'approved_by_director_at' => null,
        ]);

        expect($need->isLocked($this->staffUser))->toBeTrue();
        expect($need->isLocked())->toBeTrue();
    });

    it('returns false when need has explicit override is_locked = false even if group window is closed', function () {
        $closedGroup = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => now()->subDays(10),
            'submission_end_at' => now()->subDay(),
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => false,
            'approved_by_director_at' => null,
        ]);

        expect($need->isLocked($this->staffUser))->toBeFalse();
        expect($need->isLocked())->toBeFalse();
    });
});

describe('Policy enforcement on locked Needs', function () {
    it('denies submitter from updating a locked need', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
            'locked_at' => now(),
            'lock_reason' => 'Deadline passed',
        ]);

        $response = $this->actingAs($this->staffUser)
            ->put(route('needs.update', $need), [
                'need_group_id' => $this->openGroup->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Updated Title',
                'volume' => 10,
                'unit' => 'unit',
                'unit_price' => 100000,
                'total_price' => 1000000,
                'urgency' => Urgency::High->value,
                'impact' => Impact::Low->value,
            ]);

        $response->assertForbidden();
    });

    it('denies submitter from updating a need approved by director', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'approved_by_director_at' => now(),
        ]);

        $response = $this->actingAs($this->staffUser)
            ->put(route('needs.update', $need), [
                'need_group_id' => $this->openGroup->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Updated Title',
                'volume' => 10,
                'unit' => 'unit',
                'unit_price' => 100000,
                'total_price' => 1000000,
                'urgency' => Urgency::High->value,
                'impact' => Impact::Low->value,
            ]);

        $response->assertForbidden();
    });

    it('denies submitter from deleting a locked need', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
        ]);

        $response = $this->actingAs($this->staffUser)
            ->delete(route('needs.destroy', $need));

        $response->assertForbidden();
        expect(Need::find($need->id))->not->toBeNull();
    });

    it('denies submitter from deleting a need approved by director', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'approved_by_director_at' => now(),
        ]);

        $response = $this->actingAs($this->staffUser)
            ->delete(route('needs.destroy', $need));

        $response->assertForbidden();
        expect(Need::find($need->id))->not->toBeNull();
    });

    it('allows super-admin to update and delete a locked need', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
            'approved_by_director_at' => now(),
        ]);

        $response = $this->actingAs($this->superAdminUser)
            ->put(route('needs.update', $need), [
                'need_group_id' => $this->openGroup->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Super Admin Updated Title',
                'volume' => 10,
                'unit' => 'unit',
                'unit_price' => 100000,
                'total_price' => 1000000,
                'urgency' => Urgency::High->value,
                'impact' => Impact::Low->value,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect($need->fresh()->title)->toBe('Super Admin Updated Title');
    });

    it('denies submitters from adding attachments to a locked need', function () {
        Storage::fake('local');

        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
        ]);

        $file = UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf');

        $response = $this->actingAs($this->staffUser)
            ->post(route('needs.attachments.store', $need), [
                'file' => $file,
                'display_name' => 'Supporting Doc',
                'extension' => 'pdf',
                'file_size' => 1024,
            ]);

        $response->assertForbidden();
    });

    it('denies submitters from deleting attachments from a locked need', function () {
        Storage::fake('local');

        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
        ]);
        $attachment = $need->attachments()->create([
            'category' => 'general',
            'display_name' => 'test.pdf',
            'file_path' => 'attachments/test.pdf',
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
        ]);

        $response = $this->actingAs($this->staffUser)
            ->delete(route('needs.attachments.destroy', $attachment));

        $response->assertForbidden();
    });
    it('permits Planners to add and delete attachments on a locked need', function () {
        Storage::fake('local');

        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
            'lock_reason' => 'Locked by planner for review',
        ]);

        $file = UploadedFile::fake()->create('planner_evaluation_notes.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->plannerUser)
            ->post(route('needs.attachments.store', $need), [
                'file' => $file,
                'display_name' => 'Planner Evaluation Notes',
                'extension' => 'pdf',
                'file_size' => 500 * 1024,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $attachment = $need->attachments()->first();
        expect($attachment)->not->toBeNull();
        expect($attachment->display_name)->toBe('Planner Evaluation Notes');

        $deleteResponse = $this->actingAs($this->plannerUser)
            ->delete(route('needs.attachments.destroy', $attachment));

        $deleteResponse->assertSessionHasNoErrors();
        $deleteResponse->assertRedirect();
        expect($need->fresh()->attachments()->count())->toBe(0);
    });

    it('permits Directors to approve a locked need', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
            'lock_reason' => 'Locked by planner for review',
        ]);

        $response = $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'is_approved' => true,
                'notes' => 'Approved by director',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $freshNeed = $need->fresh();
        expect($freshNeed->approved_by_director_at)->not->toBeNull();
        expect($freshNeed->notes)->toBe('Approved by director');
        expect($freshNeed->is_locked)->toBeTrue();
    });

    it('permits Planners to perform checklist on a locked need', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
            'approved_by_director_at' => now(),
        ]);

        expect($this->plannerUser->can('performChecklist', $need))->toBeTrue();
    });
});

describe('Director Review lifecycle freezing and releasing', function () {
    it('automatically sets is_locked to true when approved by director', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => false,
            'approved_by_director_at' => null,
        ]);

        $response = $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'is_approved' => true,
                'notes' => 'Setujui usulan',
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();
        expect($freshNeed->approved_by_director_at)->not->toBeNull();
        expect($freshNeed->is_locked)->toBeTrue();
        expect($freshNeed->locked_at)->not->toBeNull();
        expect($freshNeed->locked_by_user_id)->toBe($this->directorUser->id);
    });

    it('releases lock when approval is rejected or cleared if group window is open', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
            'locked_at' => now()->subDay(),
            'locked_by_user_id' => $this->directorUser->id,
            'lock_reason' => 'Approved by Director',
            'approved_by_director_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'is_approved' => false,
                'notes' => 'Perlu revisi pada bagian spesifikasi',
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();
        expect($freshNeed->approved_by_director_at)->toBeNull();
        expect($freshNeed->is_locked)->toBeNull();
        expect($freshNeed->locked_at)->toBeNull();
        expect($freshNeed->locked_by_user_id)->toBeNull();
        expect($freshNeed->lock_reason)->toBeNull();
        expect($freshNeed->isLocked($this->staffUser))->toBeFalse();
    });

    it('keeps need locked when rejected if group submission window is closed', function () {
        $closedGroup = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => now()->subDays(10),
            'submission_end_at' => now()->subDay(),
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
            'approved_by_director_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'is_approved' => false,
                'notes' => 'Ditolak, dan jendela pengajuan sudah ditutup',
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();
        expect($freshNeed->approved_by_director_at)->toBeNull();
        // Since group window is closed, need->isLocked(staffUser) remains true
        expect($freshNeed->isLocked($this->staffUser))->toBeTrue();
    });
});

describe('Per-Need Override and Temporary Extension Windows', function () {
    it('allows submitter updates during an active extension window despite an expired group deadline', function () {
        $closedGroup = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => now()->subDays(10),
            'submission_end_at' => now()->subDay(),
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'unlocked_until' => now()->addHours(2),
            'approved_by_director_at' => null,
            'title' => 'Original Title',
        ]);

        $response = $this->actingAs($this->staffUser)
            ->put(route('needs.update', $need), [
                'need_group_id' => $closedGroup->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Updated During Extension',
                'volume' => 5,
                'unit' => 'unit',
                'unit_price' => 200000,
                'total_price' => 1000000,
                'urgency' => Urgency::Low->value,
                'impact' => Impact::Low->value,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect($need->fresh()->title)->toBe('Updated During Extension');
    });

    it('rejects submitter updates once the temporary extension window elapses', function () {
        $closedGroup = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => now()->subDays(10),
            'submission_end_at' => now()->subDay(),
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'unlocked_until' => now()->subMinute(),
            'approved_by_director_at' => null,
            'title' => 'Original Title',
        ]);

        $response = $this->actingAs($this->staffUser)
            ->put(route('needs.update', $need), [
                'need_group_id' => $closedGroup->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Updated After Extension Expired',
                'volume' => 5,
                'unit' => 'unit',
                'unit_price' => 200000,
                'total_price' => 1000000,
                'urgency' => Urgency::Low->value,
                'impact' => Impact::Low->value,
            ]);

        $response->assertForbidden();
        expect($need->fresh()->title)->toBe('Original Title');
    });

    it('allows submitter updates when explicitly unlocked with is_locked = false despite expired group deadline', function () {
        $closedGroup = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => now()->subDays(10),
            'submission_end_at' => now()->subDay(),
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'is_locked' => false,
            'approved_by_director_at' => null,
            'title' => 'Original Title',
        ]);

        $response = $this->actingAs($this->staffUser)
            ->put(route('needs.update', $need), [
                'need_group_id' => $closedGroup->id,
                'organizational_unit_id' => $this->orgUnit->id,
                'need_type_id' => $this->needType->id,
                'year' => 2026,
                'title' => 'Updated With Override',
                'volume' => 5,
                'unit' => 'unit',
                'unit_price' => 200000,
                'total_price' => 1000000,
                'urgency' => Urgency::Low->value,
                'impact' => Impact::Low->value,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        expect($need->fresh()->title)->toBe('Updated With Override');
    });

    it('allows planner to lock a need with a valid reason', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => false,
            'unlocked_until' => now()->addDay(),
        ]);

        $response = $this->actingAs($this->plannerUser)
            ->post(route('needs.lock', $need), [
                'lock_reason' => 'Freezing for formal review',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $freshNeed = $need->fresh();
        expect($freshNeed->is_locked)->toBeTrue();
        expect($freshNeed->locked_at)->not->toBeNull();
        expect($freshNeed->locked_by_user_id)->toBe($this->plannerUser->id);
        expect($freshNeed->lock_reason)->toBe('Freezing for formal review');
        expect($freshNeed->unlocked_until)->toBeNull();
    });

    it('allows super admin to lock a need', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
        ]);

        $response = $this->actingAs($this->superAdminUser)
            ->post(route('needs.lock', $need), [
                'lock_reason' => 'Administrative lock',
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();
        expect($freshNeed->is_locked)->toBeTrue();
        expect($freshNeed->locked_by_user_id)->toBe($this->superAdminUser->id);
    });

    it('allows planner to unlock a need with a temporary extension window', function () {
        $extensionTime = now()->addDays(3);
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
            'locked_at' => now()->subDay(),
            'locked_by_user_id' => $this->plannerUser->id,
            'lock_reason' => 'Previous lock',
        ]);

        $response = $this->actingAs($this->plannerUser)
            ->post(route('needs.unlock', $need), [
                'lock_reason' => 'Granting 3-day revision window',
                'unlocked_until' => $extensionTime->toDateTimeString(),
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $freshNeed = $need->fresh();
        expect($freshNeed->is_locked)->toBeNull();
        expect($freshNeed->locked_at)->toBeNull();
        expect($freshNeed->locked_by_user_id)->toBe($this->plannerUser->id);
        expect($freshNeed->lock_reason)->toBe('Granting 3-day revision window');
        expect($freshNeed->unlocked_until)->not->toBeNull();
        expect($freshNeed->unlocked_until->timestamp)->toBe($extensionTime->timestamp);
        expect($freshNeed->isLocked($this->staffUser))->toBeFalse();
    });

    it('allows planner to explicitly unlock a need without extension date', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'is_locked' => true,
        ]);

        $response = $this->actingAs($this->plannerUser)
            ->post(route('needs.unlock', $need), [
                'lock_reason' => 'Indefinite unlock for corrections',
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();
        expect($freshNeed->is_locked)->toBeFalse();
        expect($freshNeed->unlocked_until)->toBeNull();
    });

    it('denies unauthorized staff and director from locking or unlocking needs', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
        ]);

        // Staff lock attempt
        $this->actingAs($this->staffUser)
            ->post(route('needs.lock', $need), [
                'lock_reason' => 'Staff trying to lock',
            ])
            ->assertForbidden();

        // Staff unlock attempt
        $this->actingAs($this->staffUser)
            ->post(route('needs.unlock', $need), [
                'lock_reason' => 'Staff trying to unlock',
            ])
            ->assertForbidden();

        // Director lock attempt (Director has 'approve any needs', but not 'lock needs' / 'unlock needs')
        $this->actingAs($this->directorUser)
            ->post(route('needs.lock', $need), [
                'lock_reason' => 'Director trying to lock',
            ])
            ->assertForbidden();

        $this->actingAs($this->directorUser)
            ->post(route('needs.unlock', $need), [
                'lock_reason' => 'Director trying to unlock',
            ])
            ->assertForbidden();
    });

    it('validates lock and unlock request inputs', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
        ]);

        // Empty lock reason
        $this->actingAs($this->plannerUser)
            ->post(route('needs.lock', $need), [
                'lock_reason' => '',
            ])
            ->assertSessionHasErrors(['lock_reason']);

        // Empty unlock reason
        $this->actingAs($this->plannerUser)
            ->post(route('needs.unlock', $need), [
                'lock_reason' => '',
            ])
            ->assertSessionHasErrors(['lock_reason']);

        // Past unlocked_until date
        $this->actingAs($this->plannerUser)
            ->post(route('needs.unlock', $need), [
                'lock_reason' => 'Test reason',
                'unlocked_until' => now()->subHour()->toDateTimeString(),
            ])
            ->assertSessionHasErrors(['unlocked_until']);
    });
});
