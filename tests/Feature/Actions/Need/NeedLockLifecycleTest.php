<?php

use App\Actions\Need\NeedLockLifecycle;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->lifecycle = app(NeedLockLifecycle::class);
    $this->actor = User::factory()->create();
    $this->need = Need::factory()->for(NeedGroup::factory()->openWindow())->create();
});

describe('lock()', function () {
    it('sets is_locked=true, records actor and reason, clears extension window', function () {
        $this->need->update(['unlocked_until' => now()->addDay()]);

        $result = $this->lifecycle->lock($this->need, 'Frozen for review', $this->actor);

        expect($result->is_locked)->toBeTrue();
        expect($result->lock_reason)->toBe('Frozen for review');
        expect($result->locked_by_user_id)->toBe($this->actor->id);
        expect($result->locked_at)->not->toBeNull();
        expect($result->unlocked_until)->toBeNull();
    });
});
describe('submit() / lockForExecutiveReview()', function () {
    it('transitions need to submitted and locks with executive review reason', function () {
        $this->need->update([
            'status' => Need::STATUS_DRAFT,
            'unlocked_until' => now()->addDay(),
        ]);

        $result = $this->lifecycle->submit($this->need, $this->actor);

        expect($result->status)->toBe(Need::STATUS_SUBMITTED);
        expect($result->is_locked)->toBeTrue();
        expect($result->lock_reason)->toBe(NeedLockLifecycle::LOCK_REASON_EXECUTIVE_REVIEW);
        expect($result->locked_by_user_id)->toBe($this->actor->id);
        expect($result->locked_at)->not->toBeNull();
        expect($result->unlocked_until)->toBeNull();
    });
});

describe('unlock()', function () {
    it('sets is_locked=false for indefinite unlock', function () {
        $this->need->update(['is_locked' => true]);

        $result = $this->lifecycle->unlock($this->need, 'Corrections needed');

        expect($result->is_locked)->toBeFalse();
        expect($result->unlocked_until)->toBeNull();
    });

    it('sets is_locked=null and unlocked_until for timed extension', function () {
        $until = now()->addDays(3);
        $result = $this->lifecycle->unlock($this->need, 'Extension granted', $this->actor, $until);

        expect($result->is_locked)->toBeNull();
        expect($result->unlocked_until->timestamp)->toBe($until->timestamp);
    });

    it('clears all overrides when inheritGroupSchedule=true', function () {
        $this->need->update([
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by_user_id' => $this->actor->id,
        ]);

        $result = $this->lifecycle->unlock(
            $this->need, null, null, null, inheritGroupSchedule: true,
        );

        expect($result->is_locked)->toBeNull();
        expect($result->locked_at)->toBeNull();
        expect($result->locked_by_user_id)->toBeNull();
    });
});

describe('approveByDirector()', function () {
    it('sets approved_by_director_at, is_locked=true, locked_at, and locked_by_user_id', function () {
        $result = $this->lifecycle->approveByDirector($this->need, 'Approved', $this->actor);

        expect($result->approved_by_director_at)->not->toBeNull();
        expect($result->is_locked)->toBeTrue();
        expect($result->locked_at)->not->toBeNull();
        expect($result->locked_by_user_id)->toBe($this->actor->id);
        expect($result->notes)->toBe('Approved');
    });
});

describe('rejectDirectorApproval()', function () {
    it('clears lock fields when group is open', function () {
        $this->need->update([
            'approved_by_director_at' => now(),
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by_user_id' => $this->actor->id,
            'lock_reason' => 'Director approved',
        ]);

        $result = $this->lifecycle->rejectDirectorApproval($this->need, 'Needs revision', isGroupOpenOrExtended: true);

        expect($result->approved_by_director_at)->toBeNull();
        expect($result->is_locked)->toBeNull();
        expect($result->locked_at)->toBeNull();
        expect($result->lock_reason)->toBeNull();
        expect($result->notes)->toBe('Needs revision');
    });

    it('keeps need effectively locked when group window is closed', function () {
        $closedGroup = NeedGroup::factory()->closedWindow()->create();
        $need = Need::factory()->for($closedGroup)->create([
            'approved_by_director_at' => now(),
            'is_locked' => true,
        ]);

        $result = $this->lifecycle->rejectDirectorApproval($need, 'Rejected', isGroupOpenOrExtended: false);

        expect($result->approved_by_director_at)->toBeNull();
        expect($result->is_locked)->toBeTrue();
    });
});
