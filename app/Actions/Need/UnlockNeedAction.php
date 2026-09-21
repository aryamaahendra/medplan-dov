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
        string $reason,
        ?User $user = null,
        DateTimeInterface|string|null $unlockedUntil = null
    ): Need {
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
