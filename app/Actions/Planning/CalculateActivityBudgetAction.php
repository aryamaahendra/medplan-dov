<?php

namespace App\Actions\Planning;

use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use Illuminate\Support\Facades\DB;

class CalculateActivityBudgetAction
{
    public function execute(PlanningActivityVersion $activity, int $year): void
    {
        $currentActivity = $activity;

        while ($currentActivity->parent_id) {
            $parentId = $currentActivity->parent_id;

            $total = PlanningActivityYear::where('yearable_type', PlanningActivityVersion::class)
                ->where('year', $year)
                ->whereHasMorph('yearable', [PlanningActivityVersion::class], function ($query) use ($parentId) {
                    $query->where('parent_id', $parentId);
                })
                ->sum(DB::raw('COALESCE(total_budget, budget, 0)'));

            $parentYear = PlanningActivityYear::firstOrNew([
                'yearable_id' => $parentId,
                'yearable_type' => PlanningActivityVersion::class,
                'year' => $year,
            ]);

            if ($parentYear->total_budget != $total) {
                $parentYear->total_budget = $total == 0 ? null : $total;
                PlanningActivityYear::withoutEvents(function () use ($parentYear) {
                    $parentYear->save();
                });
            }

            $currentActivity = PlanningActivityVersion::find($parentId);
            
            if (!$currentActivity) {
                break;
            }
        }
    }
}
