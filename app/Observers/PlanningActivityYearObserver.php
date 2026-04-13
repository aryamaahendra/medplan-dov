<?php

namespace App\Observers;

use App\Jobs\CalculateActivityBudgetJob;
use App\Models\PlanningActivityVersion;
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
        if ($planningActivityYear->yearable_type === PlanningActivityVersion::class) {
            $activity = $planningActivityYear->yearable;

            if ($activity) {
                CalculateActivityBudgetJob::dispatch($activity, $planningActivityYear->year);
            }
        }
    }
}
