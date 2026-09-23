<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\User;
use DateTimeInterface;

/**
 * Deep module owning all Need locking, unlocking, extension, schedule-inheritance,
 * and director-approval lock transitions.
 *
 * Interface:
 *   lock(Need, string, ?User): Need
 *   unlock(Need, ?string, ?User, DateTimeInterface|string|null, bool): Need
 *   approveByDirector(Need, ?string, ?User): Need
 *   rejectDirectorApproval(Need, ?string, bool): Need
 */
class NeedLockLifecycle
{
    /**
     * Explicitly lock a need, recording who locked it and why.
     * Clears any active temporary extension window.
     */
    public function lock(Need $need, string $reason, ?User $lockedBy = null): Need
    {
        $need->update([
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by_user_id' => $lockedBy?->id,
            'lock_reason' => $reason,
            'unlocked_until' => null,
        ]);

        return $need;
    }

    /**
     * Unlock a need or grant a temporary per-Need extension window.
     *
     * Three modes:
     *   - $inheritGroupSchedule = true  -> clear all per-Need overrides and fall back to group schedule
     *   - $unlockedUntil is not null    -> set a timed extension window; is_locked stays null
     *   - otherwise                     -> explicit indefinite unlock (is_locked = false)
     */
    public function unlock(
        Need $need,
        ?string $reason = null,
        ?User $actor = null,
        DateTimeInterface|string|null $unlockedUntil = null,
        bool $inheritGroupSchedule = false
    ): Need {
        if ($inheritGroupSchedule) {
            $need->update([
                'is_locked' => null,
                'locked_at' => null,
                'locked_by_user_id' => null,
                'lock_reason' => $reason,
                'unlocked_until' => null,
            ]);

            return $need;
        }

        $need->update([
            'is_locked' => $unlockedUntil !== null ? null : false,
            'locked_at' => null,
            'locked_by_user_id' => $actor?->id,
            'lock_reason' => $reason,
            'unlocked_until' => $unlockedUntil,
        ]);

        return $need;
    }

    /**
     * Record Director approval and freeze the need.
     * Sets approved_by_director_at, is_locked = true, locked_at, locked_by_user_id.
     */
    public function approveByDirector(Need $need, ?string $notes, ?User $approver = null): Need
    {
        $need->update([
            'notes' => $notes,
            'approved_by_director_at' => now(),
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by_user_id' => $approver?->id,
        ]);

        return $need;
    }

    /**
     * Release Director approval.
     *
     * If the group window is open or an active extension window exists, all
     * per-Need lock overrides are cleared so the need becomes editable again.
     * If the group window is closed and no extension exists, the need remains
     * locked through the group-schedule tier and submitters cannot edit it.
     */
    public function rejectDirectorApproval(Need $need, ?string $notes, bool $isGroupOpenOrExtended): Need
    {
        $attributes = [
            'notes' => $notes,
            'approved_by_director_at' => null,
        ];

        if ($isGroupOpenOrExtended) {
            $attributes['is_locked'] = null;
            $attributes['locked_at'] = null;
            $attributes['locked_by_user_id'] = null;
            $attributes['lock_reason'] = null;
        }

        $need->update($attributes);

        return $need;
    }
}
