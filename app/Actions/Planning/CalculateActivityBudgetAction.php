<?php

declare(strict_types=1);

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
    public function handle(PlanningVersion $version): void
    {
        $this->recalculateVersion($version);
    }

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
                CalculateActivityBudgetJob::dispatch($source, $year)->afterCommit();
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
     * Canonical entry point to reconcile budget rollups for a given activity and year.
     */
    public function reconcile(PlanningActivityVersion $activity, int $year): void
    {
        $this->execute($activity, $year);
    }

    /**
     * Reconcile budget rollups across all active years when an activity is moved within the hierarchy.
     */
    public function reconcileActivityMove(
        PlanningActivityVersion $activity,
        ?int $originalParentId,
        ?int $newParentId
    ): void {
        if ($originalParentId === $newParentId) {
            return;
        }

        $years = $activity->activityYears()->pluck('year');

        if ($years->isEmpty()) {
            return;
        }

        // Recalculate old parent chain
        if ($originalParentId) {
            $oldParent = PlanningActivityVersion::find($originalParentId);
            if ($oldParent) {
                foreach ($years as $year) {
                    $this->recalculateParent($oldParent, $year);
                }
            }
        }

        // Recalculate new parent chain
        if ($newParentId) {
            $newParent = PlanningActivityVersion::find($newParentId);
            if ($newParent) {
                foreach ($years as $year) {
                    $this->recalculateParent($newParent, $year);
                }
            }
        }
    }

    /**
     * Recalculate both budget lanes from a given node upward in a single atomic pass.
     * Used for structural changes (parent_id moves) where type-routing doesn't apply.
     */
    public function recalculateParent(PlanningActivityVersion $activity, int $year): void
    {
        $targetId = $activity->id;

        while ($targetId) {
            $targetId = $this->recalculateNodeDual($targetId, $year);
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
        DB::transaction(function () use ($activityId, $year, $field) {
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

    /**
     * Recalculate both manual and computed budgets for a node in a single atomic transaction.
     *
     * @return int|null The parent_id to continue walking upward, or null to stop.
     */
    private function recalculateNodeDual(int $activityId, int $year): ?int
    {
        DB::transaction(function () use ($activityId, $year) {
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
                if ($yearRecord && ($yearRecord->budget !== null || $yearRecord->total_budget !== null)) {
                    $yearRecord->budget = null;
                    $yearRecord->total_budget = null;
                    PlanningActivityYear::withoutEvents(fn () => $yearRecord->save());
                }

                return;
            }

            $totalManual = $childYears->sum(fn ($child) => (float) ($child->budget ?? 0));
            $totalComputed = $childYears->sum(fn ($child) => (float) ($child->total_budget ?? $child->budget ?? 0));

            if (! $yearRecord) {
                $yearRecord = new PlanningActivityYear([
                    'yearable_id' => $activityId,
                    'yearable_type' => PlanningActivityVersion::class,
                    'year' => $year,
                ]);
            }

            $newBudget = $totalManual == 0 ? null : $totalManual;
            $newTotalBudget = $totalComputed == 0 ? null : $totalComputed;

            if ((float) $yearRecord->budget !== (float) $newBudget || (float) $yearRecord->total_budget !== (float) $newTotalBudget) {
                $yearRecord->budget = $newBudget;
                $yearRecord->total_budget = $newTotalBudget;

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
