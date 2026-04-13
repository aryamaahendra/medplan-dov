<?php

namespace App\Observers;

use App\Models\PlanningActivityYear;

class PlanningActivityYearObserver
{
    public function saved(PlanningActivityYear $planningActivityYear): void
    {
        $this->updateParent($planningActivityYear);
    }

    public function deleted(PlanningActivityYear $planningActivityYear): void
    {
        $this->updateParent($planningActivityYear);
    }

    private function updateParent(PlanningActivityYear $planningActivityYear): void
    {
        if ($planningActivityYear->yearable_type === \App\Models\PlanningActivityVersion::class) {
            $activity = $planningActivityYear->yearable;

            if ($activity) {
                app(\App\Actions\Planning\CalculateActivityBudgetAction::class)->execute($activity, $planningActivityYear->year);
            }
        }
    }
}
