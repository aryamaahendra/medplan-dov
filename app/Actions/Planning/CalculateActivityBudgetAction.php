<?php

namespace App\Actions\Planning;

use App\Enums\PlanningActivityType;
use App\Jobs\CalculateActivityBudgetJob;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use App\Models\PlanningVersion;
use Illuminate\Support\Facades\DB;

class CalculateActivityBudgetAction
{
    /**
     * Synchronize all budgets for the given version asynchronously.
     */
    public function recalculateVersion(PlanningVersion $version): void
    {
        $vId = $version->id;

        // 1. Clear derivative manual budgets (Kegiatan and Program are derivative)
        PlanningActivityYear::whereHasMorph('yearable', [PlanningActivityVersion::class], function ($query) use ($vId) {
            $query->where('planning_version_id', $vId)
                ->whereIn('type', [PlanningActivityType::Kegiatan, PlanningActivityType::Program]);
        })->update(['budget' => null]);

        // 2. Clear all computed total_budgets
        PlanningActivityYear::whereHasMorph('yearable', [PlanningActivityVersion::class], function ($query) use ($vId) {
            $query->where('planning_version_id', $vId);
        })->update(['total_budget' => null]);

        // 3. Identify all source activities for rollups
        $sources = PlanningActivityVersion::where('planning_version_id', $vId)
            ->whereIn('type', [
                PlanningActivityType::Subkegiatan,
                PlanningActivityType::Kegiatan,
                PlanningActivityType::Output,
            ])
            ->get();

        $startYear = $version->year_start;
        $endYear = $version->year_end;

        // 4. Dispatch jobs for each source and year
        foreach ($sources as $source) {
            for ($year = $startYear; $year <= $endYear; $year++) {
                CalculateActivityBudgetJob::dispatch($source, $year);
            }
        }
    }

    /**
     * Execute the budget rollup for the given activity and year.
     *
     * Routing logic based on the activity's type:
     * - Subkegiatan: manual budget rollup (→ Kegiatan → Program)
     * - Kegiatan: manual budget rollup (→ Program)
     * - Output (under Subkegiatan): computed budget rollup (→ Subkegiatan → Kegiatan → Program)
     * - Outcome / Output (under Kegiatan): do nothing
     */
    public function execute(PlanningActivityVersion $activity, int $year): void
    {
        $activity->loadMissing('parent');

        match (true) {
            // Subkegiatan manual budget updated → roll up manual budget starting from its parent
            $activity->type === PlanningActivityType::Subkegiatan => $this->rollupManualBudget($activity->parent_id, $year),

            // Kegiatan manual budget updated → roll up manual budget starting from its parent
            $activity->type === PlanningActivityType::Kegiatan => $this->rollupManualBudget($activity->parent_id, $year),

            // Output under Subkegiatan → compute subkegiatan total_budget, then roll up computed
            $activity->type === PlanningActivityType::Output
                && $activity->parent?->type === PlanningActivityType::Subkegiatan => $this->rollupComputedBudget($activity->parent_id, $year),

            // Outcome, Output under Kegiatan, Program → do nothing
            default => null,
        };
    }

    /**
     * Recalculate both budget lanes from a given node upward.
     * Used for structural changes (parent_id moves) where type-routing doesn't apply.
     */
    public function recalculateParent(PlanningActivityVersion $activity, int $year): void
    {
        $targetId = $activity->id;

        while ($targetId) {
            $this->recalculateNode($targetId, $year, 'budget');
            $targetId = $this->recalculateNode($targetId, $year, 'total_budget');
        }
    }

    /**
     * Walk up the parent chain, summing children's `budget` into parent's `budget`.
     *
     * @param  int|null  $parentId  The parent activity to start summing at.
     */
    private function rollupManualBudget(?int $parentId, int $year): void
    {
        $targetId = $parentId;

        while ($targetId) {
            $targetId = $this->recalculateNode($targetId, $year, 'budget');
        }
    }

    /**
     * Walk up the parent chain, summing children's `total_budget` into parent's `total_budget`.
     * At the leaf level (Subkegiatan), uses children's `budget` as the seed since Output nodes
     * don't have `total_budget`.
     *
     * @param  int|null  $startId  The Subkegiatan (or first parent) to start computing at.
     */
    private function rollupComputedBudget(?int $startId, int $year): void
    {
        $targetId = $startId;

        while ($targetId) {
            $targetId = $this->recalculateNode($targetId, $year, 'total_budget');
        }
    }

    /**
     * Recalculate a single node's aggregated field from its direct children.
     *
     * @param  string  $field  Either 'budget' or 'total_budget'.
     * @return int|null The parent_id to continue walking, or null to stop.
     */
    private function recalculateNode(int $activityId, int $year, string $field): ?int
    {
        $parentId = null;

        DB::transaction(function () use ($activityId, $year, $field, &$parentId) {
            $yearRecord = PlanningActivityYear::where('yearable_id', $activityId)
                ->where('yearable_type', PlanningActivityVersion::class)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            $childYears = PlanningActivityYear::where('yearable_type', PlanningActivityVersion::class)
                ->where('year', $year)
                ->whereHasMorph('yearable', [PlanningActivityVersion::class], function ($query) use ($activityId) {
                    $query->where('parent_id', $activityId);
                })
                ->get(['budget', 'total_budget']);

            if ($childYears->isEmpty()) {
                // Clear stale value if it exists (e.g., after a child was moved away)
                if ($yearRecord && $yearRecord->{$field} !== null) {
                    $yearRecord->{$field} = null;
                    PlanningActivityYear::withoutEvents(fn () => $yearRecord->save());
                }

                return;
            }

            $total = $childYears->sum(function ($child) use ($field) {
                // For total_budget rollup: leaf nodes (Output) don't have total_budget,
                // so fall back to their budget as seed value.
                if ($field === 'total_budget') {
                    return (float) ($child->total_budget ?? $child->budget ?? 0);
                }

                return (float) ($child->budget ?? 0);
            });

            if (! $yearRecord) {
                $yearRecord = new PlanningActivityYear([
                    'yearable_id' => $activityId,
                    'yearable_type' => PlanningActivityVersion::class,
                    'year' => $year,
                ]);
            }

            if ((float) $yearRecord->{$field} !== $total) {
                $yearRecord->{$field} = $total == 0 ? null : $total;

                PlanningActivityYear::withoutEvents(function () use ($yearRecord) {
                    $yearRecord->save();
                });
            }
        });

        $activity = PlanningActivityVersion::find($activityId);
        $parentId = $activity?->parent_id;

        return $parentId;
    }
}
