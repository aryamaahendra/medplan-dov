<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\KpiGroup;
use App\Models\Need;
use App\Models\PlanningActivityVersion;
use App\Models\StrategicServicePlan;
use App\Models\Tujuan;
use Illuminate\Database\Eloquent\Collection;

/**
 * Deep module owning all institutional Strategic Alignment operations for Need proposals:
 * loading option trees, synchronizing relationships, cloning during rollover, and verifying completeness.
 */
class NeedStrategicAlignmentEngine
{
    /**
     * Load all institutional strategic alignment option trees for proposal forms.
     *
     * @return array{
     *     tujuans: Collection<int, Tujuan>,
     *     kpiGroups: Collection<int, KpiGroup>,
     *     strategicServicePlans: Collection<int, StrategicServicePlan>,
     *     planningActivities: Collection<int, PlanningActivityVersion>
     * }
     */
    public function loadFormOptions(): array
    {
        return [
            'tujuans' => Tujuan::query()
                ->whereHas('renstra', fn ($q) => $q->where('is_active', true))
                ->select(['id', 'renstra_id', 'name'])
                ->with([
                    'renstra:id,year_start,year_end',
                    'sasarans' => fn ($q) => $q->select(['id', 'tujuan_id', 'name']),
                    'sasarans.indicators' => fn ($q) => $q->select(['id', 'sasaran_id', 'name']),
                    'sasarans.indicators.targets' => fn ($q) => $q->select(['id', 'indicator_id', 'year', 'target']),
                ])
                ->get(),
            'kpiGroups' => KpiGroup::query()
                ->where('is_active', true)
                ->with([
                    'indicators' => fn ($q) => $q->select(['id', 'group_id', 'parent_indicator_id', 'name', 'unit', 'is_category']),
                    'indicators.annualTargets' => fn ($q) => $q->select(['id', 'indicator_id', 'year', 'target_value']),
                ])
                ->get(),
            'strategicServicePlans' => StrategicServicePlan::query()
                ->select(['id', 'strategic_program', 'service_plan', 'year'])
                ->get(),
            'planningActivities' => PlanningActivityVersion::query()
                ->whereHas('planningVersion', fn ($q) => $q->where('is_current', true))
                ->whereNull('parent_id')
                ->with([
                    'planningVersion:id,year_start,year_end',
                    'activityYears',
                    'indicators.activityYears',
                    'children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                    'children.children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                    'children.children.children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                    'children.children.children.children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                ])
                ->get(),
        ];
    }

    /**
     * Synchronize strategic alignment hierarchies for a Need proposal.
     * Supports both complete sync (creation) and partial sync (updates where null indicates untouched).
     *
     * @param  array{
     *     sasaran_ids?: ?array<int, int>,
     *     indicator_ids?: ?array<int, int>,
     *     kpi_indicator_ids?: ?array<int, int>,
     *     strategic_service_plan_ids?: ?array<int, int>,
     *     planning_activity_version_ids?: ?array<int, int>,
     *     planning_activity_indicator_ids?: ?array<int, int>,
     *     sasaranIds?: ?array<int, int>,
     *     indicatorIds?: ?array<int, int>,
     *     kpiIndicatorIds?: ?array<int, int>,
     *     strategicServicePlanIds?: ?array<int, int>,
     *     planningActivityVersionIds?: ?array<int, int>,
     *     planningActivityIndicatorIds?: ?array<int, int>
     * }|NeedProposalPayload  $alignments
     */
    public function syncForNeed(Need $need, array|NeedProposalPayload $alignments, bool $isPartialUpdate = false): void
    {
        $sasaranIds = $alignments instanceof NeedProposalPayload ? $alignments->sasaranIds : ($alignments['sasaran_ids'] ?? $alignments['sasaranIds'] ?? null);
        $indicatorIds = $alignments instanceof NeedProposalPayload ? $alignments->indicatorIds : ($alignments['indicator_ids'] ?? $alignments['indicatorIds'] ?? null);
        $kpiIndicatorIds = $alignments instanceof NeedProposalPayload ? $alignments->kpiIndicatorIds : ($alignments['kpi_indicator_ids'] ?? $alignments['kpiIndicatorIds'] ?? null);
        $strategicPlanIds = $alignments instanceof NeedProposalPayload ? $alignments->strategicServicePlanIds : ($alignments['strategic_service_plan_ids'] ?? $alignments['strategicServicePlanIds'] ?? null);
        $planningVersionIds = $alignments instanceof NeedProposalPayload ? $alignments->planningActivityVersionIds : ($alignments['planning_activity_version_ids'] ?? $alignments['planningActivityVersionIds'] ?? null);
        $planningIndicatorIds = $alignments instanceof NeedProposalPayload ? $alignments->planningActivityIndicatorIds : ($alignments['planning_activity_indicator_ids'] ?? $alignments['planningActivityIndicatorIds'] ?? null);

        if (! $isPartialUpdate || $sasaranIds !== null) {
            $need->sasarans()->sync($sasaranIds ?? []);
        }

        if (! $isPartialUpdate || $indicatorIds !== null) {
            $need->indicators()->sync($indicatorIds ?? []);
        }

        if (! $isPartialUpdate || $kpiIndicatorIds !== null) {
            $need->kpiIndicators()->sync($kpiIndicatorIds ?? []);
        }

        if (! $isPartialUpdate || $strategicPlanIds !== null) {
            $need->strategicServicePlans()->sync($strategicPlanIds ?? []);
        }

        if (! $isPartialUpdate || $planningVersionIds !== null) {
            $need->planningActivityVersions()->sync($planningVersionIds ?? []);
        }

        if (! $isPartialUpdate || $planningIndicatorIds !== null) {
            $need->planningActivityIndicators()->sync($planningIndicatorIds ?? []);
        }
    }

    /**
     * Clone all strategic alignment pivot relationships from a source Need to a target Need.
     */
    public function cloneAlignments(Need $sourceNeed, Need $targetNeed): void
    {
        $sourceNeed->loadMissing([
            'sasarans:id',
            'indicators:id',
            'kpiIndicators:id',
            'strategicServicePlans:id',
            'planningActivityVersions:id',
            'planningActivityIndicators:id',
        ]);

        if ($sourceNeed->sasarans->isNotEmpty()) {
            $targetNeed->sasarans()->sync($sourceNeed->sasarans->pluck('id')->toArray());
        }

        if ($sourceNeed->indicators->isNotEmpty()) {
            $targetNeed->indicators()->sync($sourceNeed->indicators->pluck('id')->toArray());
        }

        if ($sourceNeed->kpiIndicators->isNotEmpty()) {
            $targetNeed->kpiIndicators()->sync($sourceNeed->kpiIndicators->pluck('id')->toArray());
        }

        if ($sourceNeed->strategicServicePlans->isNotEmpty()) {
            $targetNeed->strategicServicePlans()->sync($sourceNeed->strategicServicePlans->pluck('id')->toArray());
        }

        if ($sourceNeed->planningActivityVersions->isNotEmpty()) {
            $targetNeed->planningActivityVersions()->sync($sourceNeed->planningActivityVersions->pluck('id')->toArray());
        }

        if ($sourceNeed->planningActivityIndicators->isNotEmpty()) {
            $targetNeed->planningActivityIndicators()->sync($sourceNeed->planningActivityIndicators->pluck('id')->toArray());
        }
    }

    /**
     * Check whether a Need has complete institutional alignment linkages.
     */
    public function verifyCompleteness(Need $need): bool
    {
        $need->loadCount([
            'sasarans',
            'indicators',
            'kpiIndicators',
            'strategicServicePlans',
        ]);

        return ($need->sasarans_count ?? 0) > 0
            && ($need->indicators_count ?? 0) > 0
            && ($need->kpi_indicators_count ?? 0) > 0
            && ($need->strategic_service_plans_count ?? 0) > 0;
    }
}
