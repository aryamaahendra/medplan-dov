<?php

namespace App\Observers;

use App\Actions\Planning\CalculateActivityBudgetAction;
use App\Models\PlanningActivityVersion;

class PlanningActivityVersionObserver
{
    public function updated(PlanningActivityVersion $activity): void
    {
        if ($activity->isDirty('parent_id')) {
            $originalParentId = $activity->getOriginal('parent_id');
            $newParentId = $activity->parent_id;

            $years = $activity->activityYears()->pluck('year');

            if ($years->isEmpty()) {
                return;
            }

            $action = app(CalculateActivityBudgetAction::class);

            // Recalculate old parent chain
            if ($originalParentId) {
                $oldParent = PlanningActivityVersion::find($originalParentId);
                if ($oldParent) {
                    foreach ($years as $year) {
                        $action->recalculateParent($oldParent, $year);
                    }
                }
            }

            // Recalculate new parent chain
            if ($newParentId) {
                $newParent = PlanningActivityVersion::find($newParentId);
                if ($newParent) {
                    foreach ($years as $year) {
                        $action->recalculateParent($newParent, $year);
                    }
                }
            }
        }
    }
}
