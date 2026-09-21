<?php

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\User;
use DateTimeInterface;

class UnlockNeedAction
{
    /**
     * Unlock or extend the given need.
     */
    public function execute(
        Need $need,
        ?string $reason = null,
        ?User $user = null,
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
            'locked_by_user_id' => $user?->id,
            'lock_reason' => $reason,
            'unlocked_until' => $unlockedUntil,
        ]);

        return $need;
    }
}
