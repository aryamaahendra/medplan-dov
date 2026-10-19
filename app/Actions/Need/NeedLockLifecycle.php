<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\User;
use DateTimeInterface;
use Illuminate\Validation\ValidationException;

/**
 * Deep module owning all Need locking, unlocking, extension, schedule-inheritance,
 * and director-approval lock transitions.
 *
 * Interface:
 *   lock(Need, string, ?User): Need
 *   unlock(Need, ?string, ?User, DateTimeInterface|string|null, bool): Need
 *   approveByDirector(Need, ?string, ?User, ?float, ?float, bool): Need
 *   rejectByDirector(Need, ?string, ?User, bool): Need
 *   revisionByDirector(Need, string, ?User): Need
 *   rejectDirectorApproval(Need, ?string, bool): Need
 *   submit(Need, ?User): Need
 *   lockForExecutiveReview(Need, ?User): Need
 */
class NeedLockLifecycle
{
    public const string LOCK_REASON_EXECUTIVE_REVIEW = 'Usulan sedang dalam proses review eksekutif.';

    public const string LOCK_REASON_EXECUTIVE_APPROVED = 'Usulan telah disetujui oleh Direktur.';

    public const string LOCK_REASON_EXECUTIVE_REJECTED = 'Usulan telah ditolak oleh Direktur.';

    /**
     * Submit a need proposal for executive review, transitioning status to 'submitted'
     * and locking it with an explicit executive review reason.
     */
    public function submit(Need $need, ?User $actor = null): Need
    {
        if (! in_array($need->status, [Need::STATUS_DRAFT, Need::STATUS_REVISION], true)) {
            throw ValidationException::withMessages([
                'status' => 'Hanya usulan dengan status draft atau revisi yang dapat diajukan.',
            ]);
        }

        return $this->lockForExecutiveReview($need, $actor);
    }

    /**
     * Move need to submitted status and lock it for executive review.
     */
    public function lockForExecutiveReview(Need $need, ?User $actor = null): Need
    {
        $need->update([
            'status' => Need::STATUS_SUBMITTED,
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by_user_id' => $actor?->id,
            'lock_reason' => self::LOCK_REASON_EXECUTIVE_REVIEW,
            'unlocked_until' => null,
        ]);

        return $need;
    }

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
    public function approveByDirector(
        Need $need,
        ?string $notes = null,
        ?User $approver = null,
        ?float $approvedVolume = null,
        ?float $approvedUnitPrice = null,
        bool $isRecommendedForNextCycle = false,
    ): Need {
        $volume = (float) $need->volume;
        $finalApprovedVolume = $approvedVolume !== null ? $approvedVolume : $volume;
        $finalApprovedUnitPrice = $approvedUnitPrice !== null ? $approvedUnitPrice : (float) $need->unit_price;
        $finalApprovedTotalPrice = round($finalApprovedVolume * $finalApprovedUnitPrice, 2);

        $hasResidual = $isRecommendedForNextCycle && ($finalApprovedVolume < $volume);
        $recommendedVolume = $hasResidual ? round($volume - $finalApprovedVolume, 4) : null;

        $need->update([
            'status' => Need::STATUS_APPROVED,
            'notes' => $notes,
            'approved_by_director_at' => now(),
            'approved_volume' => $finalApprovedVolume,
            'approved_unit_price' => $finalApprovedUnitPrice,
            'approved_total_price' => $finalApprovedTotalPrice,
            'is_recommended_for_next_cycle' => $hasResidual,
            'recommended_volume' => $recommendedVolume,
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by_user_id' => $approver?->id,
            'lock_reason' => self::LOCK_REASON_EXECUTIVE_APPROVED,
            'unlocked_until' => null,
        ]);

        return $need;
    }

    /**
     * Record Director rejection, freeze the proposal, and set full volume as recommended volume if requested.
     */
    public function rejectByDirector(
        Need $need,
        ?string $notes = null,
        ?User $actor = null,
        bool $isRecommendedForNextCycle = false,
    ): Need {
        $recommendedVolume = $isRecommendedForNextCycle ? (float) $need->volume : null;

        $need->update([
            'status' => Need::STATUS_REJECTED,
            'notes' => $notes,
            'approved_by_director_at' => null,
            'approved_volume' => null,
            'approved_unit_price' => null,
            'approved_total_price' => null,
            'is_recommended_for_next_cycle' => $isRecommendedForNextCycle,
            'recommended_volume' => $recommendedVolume,
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by_user_id' => $actor?->id,
            'lock_reason' => self::LOCK_REASON_EXECUTIVE_REJECTED,
            'unlocked_until' => null,
        ]);

        return $need;
    }

    /**
     * Request revision by Director, record mandatory notes, and unlock proposal for submitting unit.
     */
    public function revisionByDirector(
        Need $need,
        string $notes,
        ?User $actor = null,
    ): Need {
        $need->update([
            'status' => Need::STATUS_REVISION,
            'notes' => $notes,
            'approved_by_director_at' => null,
            'approved_volume' => null,
            'approved_unit_price' => null,
            'approved_total_price' => null,
            'is_recommended_for_next_cycle' => false,
            'recommended_volume' => null,
            'is_locked' => null,
            'locked_at' => null,
            'locked_by_user_id' => null,
            'lock_reason' => null,
            'unlocked_until' => null,
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
