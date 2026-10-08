<?php

declare(strict_types=1);

namespace App\Observers;

use App\Actions\Planning\CalculateActivityBudgetAction;
use App\Models\PlanningActivityVersion;

class PlanningActivityVersionObserver
{
    public function __construct(
        protected CalculateActivityBudgetAction $calculator
    ) {}

    public function updated(PlanningActivityVersion $activity): void
    {
        if ($activity->isDirty('parent_id')) {
            $this->calculator->reconcileActivityMove(
                $activity,
                $activity->getOriginal('parent_id'),
                $activity->parent_id
            );
        }
    }
}
