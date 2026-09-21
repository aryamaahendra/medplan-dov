<?php

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\User;

class LockNeedAction
{
    /**
     * Lock the given need.
     */
    public function execute(Need $need, string $reason, ?User $user = null): Need
    {
        $need->update([
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by_user_id' => $user?->id,
            'lock_reason' => $reason,
            'unlocked_until' => null,
        ]);

        return $need;
    }
}
