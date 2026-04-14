<?php

namespace App\Observers;

use App\Actions\Need\RecalculateNeedChecklistScore;
use App\Models\NeedChecklistAnswer;

class NeedChecklistAnswerObserver
{
    public function __construct(
        protected RecalculateNeedChecklistScore $recalculateScore
    ) {}

    /**
     * Handle the NeedChecklistAnswer "saved" event (created or updated).
     */
    public function saved(NeedChecklistAnswer $needChecklistAnswer): void
    {
        $this->recalculateScore->execute($needChecklistAnswer->need);
    }

    /**
     * Handle the NeedChecklistAnswer "deleted" event.
     */
    public function deleted(NeedChecklistAnswer $needChecklistAnswer): void
    {
        $this->recalculateScore->execute($needChecklistAnswer->need);
    }
}
