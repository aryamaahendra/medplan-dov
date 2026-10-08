<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\Sasaran;
use App\Models\Tujuan;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

final class GetNeedDashboardStatsAction
{
    public function __construct(
        protected NeedExceptionCatalog $exceptionCatalog
    ) {}

    /**
     * Cache TTL in seconds (60s as per planning spec).
     */
    public const int CACHE_TTL = 60;

    /**
     * Compute full dashboard payload for a given group and user scope.
     *
     * @return array<string, mixed>
     */
    public function getDashboardPayload(int|string|null $groupId, ?User $user = null, ?int $compareGroupId = null): array
    {
        if (! $groupId) {
            return [];
        }

        $userId = $user ? $user->id : 0;
        $roleScopeKey = $this->resolveScopeKey($user);
        $cacheKey = "needs_dashboard_{$groupId}_{$userId}_{$roleScopeKey}_comp_{$compareGroupId}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($groupId, $user, $compareGroupId) {
            return $this->computeDashboardPayload((int) $groupId, $user, $compareGroupId);
        });
    }

    /**
     * Clear dashboard cache for a need group.
     */
    public static function clearCacheForGroup(?int $groupId = null): void
    {
        // Cache tag or flush if supported, otherwise general cache clear
        // Since array/database cache might not support tags, we can bump a version or flush pattern
        // In local/testing/production, we can touch cache version or clear specific keys
        Cache::increment('needs_dashboard_cache_version');
    }

    /**
     * Resolve unique scope key for caching.
     */
    private function resolveScopeKey(?User $user): string
    {
        if (! $user) {
            return 'anon';
        }

        if ($user->can('view any needs')) {
            return 'all';
        }

        if ($user->can('view descendant needs') && $user->organizational_unit_id) {
            return "desc_{$user->organizational_unit_id}";
        }

        return "unit_{$user->organizational_unit_id}";
    }

    /**
     * Apply user scope to query.
     */
    public function applyScope(Builder $query, ?User $user): Builder
    {
        if (! $user) {
            return $query;
        }

        if (! $user->can('view any needs')) {
            if ($user->can('view descendant needs') && $user->organizational_unit_id) {
                $unit = $user->organizationalUnit;
                if ($unit) {
                    $unit->loadMissing('descendantsRecursive');
                    $allowedIds = $this->extractUnitIds($unit);
                    $query->whereIn('organizational_unit_id', $allowedIds);
                } else {
                    $query->where('organizational_unit_id', $user->organizational_unit_id);
                }
            } else {
                $query->where('organizational_unit_id', $user->organizational_unit_id);
            }
        }

        return $query;
    }

    /**
     * @return array<int>
     */
    private function extractUnitIds(OrganizationalUnit $unit): array
    {
        $ids = [$unit->id];
        foreach ($unit->descendantsRecursive as $child) {
            $ids = array_merge($ids, $this->extractUnitIds($child));
        }

        return $ids;
    }

    /**
     * Raw stage CASE SQL string for Postgres & SQLite.
     * Derived Stage:
     * - 'rejected': status = 'rejected'
     * - 'approved': approved_by_director_at IS NOT NULL
     * - 'under_review': status = 'approved' AND approved_by_director_at IS NULL
     * - 'draft': everything else
     */
    private function stageCaseSql(): string
    {
        return "CASE
            WHEN status = 'rejected' THEN 'rejected'
            WHEN approved_by_director_at IS NOT NULL THEN 'approved'
            WHEN status = 'approved' THEN 'under_review'
            ELSE 'draft'
        END";
    }

    /**
     * Compute actual payload.
     */
    private function computeDashboardPayload(int $groupId, ?User $user, ?int $compareGroupId = null): array
    {
        $currentGroup = NeedGroup::query()->find($groupId);

        // Resolve previous / compare group
        $prevGroup = null;
        if ($compareGroupId) {
            $prevGroup = NeedGroup::query()->find($compareGroupId);
        } elseif ($currentGroup) {
            $prevGroup = NeedGroup::query()
                ->where('id', '!=', $groupId)
                ->where('year', '<=', $currentGroup->year)
                ->orderByDesc('year')
                ->orderByDesc('id')
                ->first();
        }

        $baseQuery = Need::query()->where('need_group_id', $groupId);
        $this->applyScope($baseQuery, $user);

        // 1. KPI & Overview Aggregates
        $stageCase = $this->stageCaseSql();
        /** @var object{total_needs?: int|string, active_needs_count?: int|string, total_budget?: int|float|string, assessed_needs_count?: int|string, avg_completeness?: int|float|string, priority_needs?: int|string, unapproved_priority_count?: int|string, unapproved_priority_budget?: int|float|string, approved_by_director_count?: int|string, approved_budget?: int|float|string, awaiting_director_count?: int|string, awaiting_director_budget?: int|float|string, draft_count?: int|string, draft_budget?: int|float|string, rejected_count?: int|string, rejected_budget?: int|float|string, locked_count?: int|string}|null $aggregates */
        $aggregates = (clone $baseQuery)
            ->toBase()
            ->selectRaw("
                COUNT(*) as total_needs,
                COUNT(CASE WHEN {$stageCase} != 'rejected' THEN 1 END) as active_needs_count,
                COALESCE(SUM(CASE WHEN {$stageCase} != 'rejected' THEN total_price ELSE 0 END), 0) as total_budget,
                COUNT(CASE WHEN {$stageCase} != 'rejected' AND checklist_percentage > 0 THEN 1 END) as assessed_needs_count,
                COALESCE(AVG(CASE WHEN {$stageCase} != 'rejected' AND checklist_percentage > 0 THEN checklist_percentage END), 0) as avg_completeness,
                COUNT(CASE WHEN is_priority = true AND {$stageCase} != 'rejected' THEN 1 END) as priority_needs,
                COUNT(CASE WHEN is_priority = true AND approved_by_director_at IS NULL AND {$stageCase} != 'rejected' THEN 1 END) as unapproved_priority_count,
                COALESCE(SUM(CASE WHEN is_priority = true AND approved_by_director_at IS NULL AND {$stageCase} != 'rejected' THEN total_price ELSE 0 END), 0) as unapproved_priority_budget,
                COUNT(CASE WHEN approved_by_director_at IS NOT NULL THEN 1 END) as approved_by_director_count,
                COALESCE(SUM(CASE WHEN approved_by_director_at IS NOT NULL THEN total_price ELSE 0 END), 0) as approved_budget,
                COUNT(CASE WHEN status = 'approved' AND approved_by_director_at IS NULL THEN 1 END) as awaiting_director_count,
                COALESCE(SUM(CASE WHEN status = 'approved' AND approved_by_director_at IS NULL THEN total_price ELSE 0 END), 0) as awaiting_director_budget,
                COUNT(CASE WHEN {$stageCase} = 'draft' THEN 1 END) as draft_count,
                COALESCE(SUM(CASE WHEN {$stageCase} = 'draft' THEN total_price ELSE 0 END), 0) as draft_budget,
                COUNT(CASE WHEN {$stageCase} = 'rejected' THEN 1 END) as rejected_count,
                COALESCE(SUM(CASE WHEN {$stageCase} = 'rejected' THEN total_price ELSE 0 END), 0) as rejected_budget,
                COUNT(CASE WHEN is_locked = true THEN 1 END) as locked_count
            ")
            ->first();
        // Previous period aggregates for comparison
        $prevAggregates = null;
        if ($prevGroup) {
            $prevQuery = Need::query()->where('need_group_id', $prevGroup->id);
            $this->applyScope($prevQuery, $user);
            /** @var object{total_needs?: int|string, active_needs_count?: int|string, total_budget?: int|float|string, avg_completeness?: int|float|string, priority_needs?: int|string, approved_by_director_count?: int|string, approved_budget?: int|float|string}|null $prevAggregates */
            $prevAggregates = $prevQuery
                ->toBase()
                ->selectRaw("
                    COUNT(*) as total_needs,
                    COUNT(CASE WHEN {$stageCase} != 'rejected' THEN 1 END) as active_needs_count,
                    COALESCE(SUM(CASE WHEN {$stageCase} != 'rejected' THEN total_price ELSE 0 END), 0) as total_budget,
                    COALESCE(AVG(CASE WHEN {$stageCase} != 'rejected' AND checklist_percentage > 0 THEN checklist_percentage END), 0) as avg_completeness,
                    COUNT(CASE WHEN is_priority = true AND {$stageCase} != 'rejected' THEN 1 END) as priority_needs,
                    COUNT(CASE WHEN approved_by_director_at IS NOT NULL THEN 1 END) as approved_by_director_count,
                    COALESCE(SUM(CASE WHEN approved_by_director_at IS NOT NULL THEN total_price ELSE 0 END), 0) as approved_budget
                ")
                ->first();
        }
        $totalNeeds = (int) ($aggregates->total_needs ?? 0);
        $activeNeedsCount = (int) ($aggregates->active_needs_count ?? 0);
        $totalBudget = (float) ($aggregates->total_budget ?? 0);
        $assessedCount = (int) ($aggregates->assessed_needs_count ?? 0);

        $stats = [
            'total_needs' => $totalNeeds,
            'active_needs_count' => $activeNeedsCount,
            'total_budget' => $totalBudget,
            'priority_needs' => (int) ($aggregates->priority_needs ?? 0),
            'unapproved_priority_count' => (int) ($aggregates->unapproved_priority_count ?? 0),
            'unapproved_priority_budget' => (float) ($aggregates->unapproved_priority_budget ?? 0),
            'avg_completeness' => (float) ($aggregates->avg_completeness ?? 0),
            'assessed_needs_count' => $assessedCount,
            'approved_by_director' => (int) ($aggregates->approved_by_director_count ?? 0),
            'approved_budget' => (float) ($aggregates->approved_budget ?? 0),
            'awaiting_director' => (int) ($aggregates->awaiting_director_count ?? 0),
            'awaiting_director_budget' => (float) ($aggregates->awaiting_director_budget ?? 0),
            'draft_count' => (int) ($aggregates->draft_count ?? 0),
            'draft_budget' => (float) ($aggregates->draft_budget ?? 0),
            'rejected_count' => (int) ($aggregates->rejected_count ?? 0),
            'rejected_budget' => (float) ($aggregates->rejected_budget ?? 0),
            'locked_count' => (int) ($aggregates->locked_count ?? 0),
            'prev_group' => $prevGroup ? ['id' => $prevGroup->id, 'name' => $prevGroup->name, 'year' => $prevGroup->year] : null,
            'prev_total_needs' => $prevAggregates ? (int) $prevAggregates->total_needs : null,
            'prev_active_needs_count' => $prevAggregates ? (int) $prevAggregates->active_needs_count : null,
            'prev_total_budget' => $prevAggregates ? (float) $prevAggregates->total_budget : null,
            'prev_approved_budget' => $prevAggregates ? (float) $prevAggregates->approved_budget : null,
            'prev_priority_needs' => $prevAggregates ? (int) $prevAggregates->priority_needs : null,
            'prev_avg_completeness' => $prevAggregates ? (float) $prevAggregates->avg_completeness : null,
            'prev_approved_by_director' => $prevAggregates ? (int) $prevAggregates->approved_by_director_count : null,
        ];
        // 2. Budget Pipeline & Stage Breakdown
        $stageDistribution = [
            'draft' => [
                'count' => $stats['draft_count'],
                'budget' => $stats['draft_budget'],
                'percentage' => $totalBudget > 0 ? round(($stats['draft_budget'] / $totalBudget) * 100, 1) : 0,
            ],
            'under_review' => [
                'count' => $stats['awaiting_director'],
                'budget' => $stats['awaiting_director_budget'],
                'percentage' => $totalBudget > 0 ? round(($stats['awaiting_director_budget'] / $totalBudget) * 100, 1) : 0,
            ],
            'approved' => [
                'count' => $stats['approved_by_director'],
                'budget' => $stats['approved_budget'],
                'percentage' => $totalBudget > 0 ? round(($stats['approved_budget'] / $totalBudget) * 100, 1) : 0,
            ],
            'rejected' => [
                'count' => $stats['rejected_count'],
                'budget' => $stats['rejected_budget'],
                'percentage' => $totalBudget > 0 ? round(($stats['rejected_budget'] / $totalBudget) * 100, 1) : 0,
            ],
        ];

        // Status counts map for backwards compatibility
        $statusDistribution = [
            'draft' => $stats['draft_count'],
            'under_review' => $stats['awaiting_director'],
            'approved' => $stats['approved_by_director'],
            'rejected' => $stats['rejected_count'],
        ];

        // 3. Priority Matrix 3x3 (urgency x impact for active non-rejected needs)
        $matrixRows = (clone $baseQuery)
            ->toBase()
            ->whereRaw("{$stageCase} != 'rejected'")
            ->selectRaw('urgency, impact, COUNT(*) as count, COALESCE(SUM(total_price), 0) as budget')
            ->groupBy('urgency', 'impact')
            ->get();
        $matrix = [];
        $urgencies = ['high', 'medium', 'low'];
        $impacts = ['high', 'medium', 'low'];
        foreach ($urgencies as $u) {
            foreach ($impacts as $imp) {
                $matrix["{$u}_{$imp}"] = [
                    'urgency' => $u,
                    'impact' => $imp,
                    'count' => 0,
                    'budget' => 0.0,
                ];
            }
        }
        foreach ($matrixRows as $row) {
            $u = strtolower((string) ($row->urgency));
            $imp = strtolower((string) ($row->impact));
            $key = "{$u}_{$imp}";
            if (isset($matrix[$key])) {
                $matrix[$key]['count'] = (int) $row->count;
                $matrix[$key]['budget'] = (float) $row->budget;
            }
        }

        // 4. Decision Queue (Top 8 under-review needs sorted by priority desc, checklist desc, total_price desc)
        $decisionQueue = (clone $baseQuery)
            ->where('status', 'approved')
            ->whereNull('approved_by_director_at')
            ->with(['organizationalUnit:id,name', 'needType:id,name'])
            ->withCount('attachments')
            ->orderByDesc('is_priority')
            ->orderByDesc('checklist_percentage')
            ->orderByDesc('total_price')
            ->limit(8)
            ->get()
            ->map(function (Need $need) use ($user): array {
                $urgencyVal = (string) $need->getRawOriginal('urgency');
                $impactVal = (string) $need->getRawOriginal('impact');

                return [
                    'id' => $need->id,
                    'title' => $need->title,
                    'unit_name' => $need->organizationalUnit->name ?? 'Unknown',
                    'organizational_unit_id' => $need->organizational_unit_id,
                    'type_name' => $need->needType->name ?? 'General',
                    'total_price' => (float) $need->total_price,
                    'volume' => $need->volume,
                    'unit' => $need->unit,
                    'urgency' => strtolower($urgencyVal),
                    'impact' => strtolower($impactVal),
                    'checklist_percentage' => (float) $need->checklist_percentage,
                    'is_priority' => (bool) $need->is_priority,
                    'attachments_count' => (int) $need->attachments_count,
                    'has_notes' => ! empty($need->notes),
                    'notes' => $need->notes,
                    'can_approve' => $user?->can('approve', $need) ?? false,
                ];
            })
            ->all();

        // 5. Budget by Unit (all units rolled up with path map, top 8 + other, excluding rejected from budget)
        $unitAggregates = (clone $baseQuery)
            ->toBase()
            ->whereRaw("{$stageCase} != 'rejected'")
            ->selectRaw("
                organizational_unit_id,
                COUNT(*) as count,
                COALESCE(SUM(total_price), 0) as total_budget,
                COUNT(CASE WHEN is_priority = true THEN 1 END) as priority_count,
                COUNT(CASE WHEN approved_by_director_at IS NOT NULL THEN 1 END) as approved_count,
                COALESCE(SUM(CASE WHEN approved_by_director_at IS NOT NULL THEN total_price ELSE 0 END), 0) as approved_budget,
                COUNT(CASE WHEN status = 'approved' AND approved_by_director_at IS NULL THEN 1 END) as under_review_count,
                COALESCE(SUM(CASE WHEN status = 'approved' AND approved_by_director_at IS NULL THEN total_price ELSE 0 END), 0) as review_budget,
                COUNT(CASE WHEN {$stageCase} = 'draft' THEN 1 END) as draft_count,
                COALESCE(SUM(CASE WHEN {$stageCase} = 'draft' THEN total_price ELSE 0 END), 0) as draft_budget,
                COUNT(CASE WHEN {$stageCase} = 'rejected' THEN 1 END) as rejected_count,
                COALESCE(SUM(CASE WHEN {$stageCase} = 'rejected' THEN total_price ELSE 0 END), 0) as rejected_budget
            ")
            ->groupBy('organizational_unit_id')
            ->orderByDesc('total_budget')
            ->get();
        // Preload all units once into memory to avoid recursive DB calls
        $allUnits = OrganizationalUnit::query()->select(['id', 'name', 'parent_id'])->get()->keyBy('id');
        $unitBreadcrumbMap = [];
        foreach ($allUnits as $u) {
            $parents = [];
            $curr = $u;
            while ($curr->parent_id && isset($allUnits[$curr->parent_id])) {
                $curr = $allUnits[$curr->parent_id];
                array_unshift($parents, $curr->name);
            }
            $unitBreadcrumbMap[$u->id] = $parents;
        }

        $needsByUnit = $unitAggregates->map(function ($item) use ($allUnits, $unitBreadcrumbMap) {
            /** @var OrganizationalUnit|null $unit */
            $unit = $allUnits->get($item->organizational_unit_id);

            return [
                'unit_id' => $item->organizational_unit_id,
                'name' => $unit->name ?? 'Unknown',
                'parents' => $unitBreadcrumbMap[$item->organizational_unit_id] ?? [],
                'count' => (int) $item->count,
                'total_budget' => (float) $item->total_budget,
                'priority_count' => (int) $item->priority_count,
                'approved_count' => (int) $item->approved_count,
                'approved_budget' => (float) $item->approved_budget,
                'under_review_count' => (int) $item->under_review_count,
                'review_budget' => (float) $item->review_budget,
                'draft_count' => (int) $item->draft_count,
                'draft_budget' => (float) $item->draft_budget,
                'rejected_count' => (int) $item->rejected_count,
            ];
        })->values()->all();
        // 6. Unit Submission Progress (scoped and with hierarchy)
        $scopedUnits = $allUnits;
        if (! $user?->can('view any needs')) {
            if ($user?->can('view descendant needs') && $user->organizational_unit_id) {
                $allowedIds = $this->extractUnitIds($user->organizationalUnit);
                $scopedUnits = $allUnits->whereIn('id', $allowedIds);
            } elseif ($user?->organizational_unit_id) {
                $scopedUnits = $allUnits->where('id', $user->organizational_unit_id);
            }
        }

        $allUnitProgress = $scopedUnits->map(function ($unit) use ($needsByUnit, $unitBreadcrumbMap) {
            $existing = collect($needsByUnit)->firstWhere('unit_id', $unit->id);
            $count = $existing['count'] ?? 0;
            $approved = $existing['approved_count'] ?? 0;
            $rate = $count > 0 ? round(($approved / $count) * 100, 1) : 0.0;
            $parents = $unitBreadcrumbMap[$unit->id] ?? [];

            return [
                'unit_id' => $unit->id,
                'name' => $unit->name,
                'parent_id' => $unit->parent_id,
                'depth' => count($parents),
                'breadcrumb' => ! empty($parents) ? implode(' > ', $parents) : null,
                'total_needs' => $count,
                'total_budget' => $existing['total_budget'] ?? 0.0,
                'draft_count' => $existing['draft_count'] ?? 0,
                'under_review_count' => $existing['under_review_count'] ?? 0,
                'approved_count' => $approved,
                'rejected_count' => $existing['rejected_count'] ?? 0,
                'completion_rate' => $rate,
                'has_submission' => $count > 0,
                'exceptions_count' => 0,
                'readiness' => 0.0,
            ];
        })->values()->sortByDesc('total_needs')->values()->all();

        // 7. Budget by Need Type (excluding rejected from budget)
        $allNeedTypes = NeedType::query()->select(['id', 'name'])->get()->keyBy('id');
        $needsByType = (clone $baseQuery)
            ->toBase()
            ->whereRaw("{$stageCase} != 'rejected'")
            ->selectRaw('need_type_id, COUNT(*) as count, COALESCE(SUM(total_price), 0) as total_budget')
            ->groupBy('need_type_id')
            ->orderByDesc('total_budget')
            ->get()
            ->map(function ($item) use ($totalBudget, $allNeedTypes): array {
                /** @var NeedType|null $type */
                $type = $allNeedTypes->get($item->need_type_id);

                return [
                    'type_id' => $item->need_type_id,
                    'name' => $type->name ?? 'Lainnya',
                    'count' => (int) $item->count,
                    'total_budget' => (float) $item->total_budget,
                    'percentage' => $totalBudget > 0 ? round(((float) $item->total_budget / $totalBudget) * 100, 1) : 0,
                    'avg_ticket' => (int) $item->count > 0 ? round((float) $item->total_budget / (int) $item->count, 2) : 0.0,
                ];
            })
            ->all();
        $needsWithAttachmentsCount = (clone $baseQuery)
            ->has('attachments')
            ->count();
        $needsWithDetailCount = (clone $baseQuery)
            ->has('detail')
            ->count();
        $needsAlignedCount = (clone $baseQuery)
            ->where(function ($q) {
                $q->has('sasarans')
                    ->orHas('indicators')
                    ->orHas('kpiIndicators')
                    ->orHas('strategicServicePlans');
            })
            ->count();

        $dataReadiness = [
            'avg_checklist' => round($stats['avg_completeness'], 1),
            'attachment_coverage' => $totalNeeds > 0 ? round(($needsWithAttachmentsCount / $totalNeeds) * 100, 1) : 0.0,
            'alignment_coverage' => $totalNeeds > 0 ? round(($needsAlignedCount / $totalNeeds) * 100, 1) : 0.0,
            'kak_detail_coverage' => $totalNeeds > 0 ? round(($needsWithDetailCount / $totalNeeds) * 100, 1) : 0.0,
        ];

        // 9. Exceptions / Needs Attention Rules (Operations Command Center)
        $now = CarbonImmutable::now('Asia/Makassar');
        $threeDaysAhead = $now->addDays(3);

        $lowChecklistDrafts = (clone $baseQuery)
            ->where('status', 'draft')
            ->where('checklist_percentage', '<', 50)
            ->count();

        $underReviewNoFiles = (clone $baseQuery)
            ->where('status', 'approved')
            ->whereNull('approved_by_director_at')
            ->doesntHave('attachments')
            ->count();

        $unalignedNeeds = (clone $baseQuery)
            ->doesntHave('sasarans')
            ->doesntHave('indicators')
            ->doesntHave('kpiIndicators')
            ->doesntHave('strategicServicePlans')
            ->count();

        $expiringUnlocks = (clone $baseQuery)
            ->whereNotNull('unlocked_until')
            ->where('unlocked_until', '>=', $now)
            ->where('unlocked_until', '<=', $threeDaysAhead)
            ->count();

        $rejectedNotRevised = (clone $baseQuery)
            ->where('status', 'rejected')
            ->count();

        $zeroSubmissionUnitsCount = collect($allUnitProgress)->where('has_submission', false)->count();

        $exceptions = [
            'low_checklist_drafts' => $lowChecklistDrafts,
            'under_review_no_files' => $underReviewNoFiles,
            'unaligned_needs' => $unalignedNeeds,
            'expiring_unlocks' => $expiringUnlocks,
            'rejected_not_revised' => $rejectedNotRevised,
            'zero_submission_units' => $zeroSubmissionUnitsCount,
        ];

        // Active Lock & Extension monitor
        $activeUnlocks = (clone $baseQuery)
            ->whereNotNull('unlocked_until')
            ->where('unlocked_until', '>=', $now)
            ->with(['organizationalUnit:id,name', 'lockedByUser:id,name'])
            ->orderBy('unlocked_until')
            ->limit(10)
            ->get()
            ->map(function (Need $need) use ($user): array {
                /** @var CarbonInterface|null $unlockedUntil */
                $unlockedUntil = $need->unlocked_until;

                return [
                    'id' => $need->id,
                    'title' => $need->title,
                    'unit_name' => $need->organizationalUnit->name ?? 'Unknown',
                    'unlocked_until' => $unlockedUntil?->toIso8601String(),
                    'lock_reason' => $need->lock_reason,
                    'can_lock' => $user?->can('lock', $need) ?? false,
                    'can_unlock' => $user?->can('unlock', $need) ?? false,
                ];
            })
            ->all();

        // 10. Alignment & Renstra Analysis (Variant C)
        $sasaranOverview = Sasaran::query()
            ->withCount(['needs' => function ($q) use ($groupId, $user) {
                $q->where('need_group_id', $groupId);
                $this->applyScope($q, $user);
            }])
            ->with(['tujuan:id,name'])
            ->get()
            ->map(function (Sasaran $sasaran): array {
                /** @var Tujuan|null $tujuan */
                $tujuan = $sasaran->tujuan;

                return [
                    'id' => $sasaran->id,
                    'name' => $sasaran->name,
                    'tujuan_name' => $tujuan->name ?? 'Renstra',
                    'needs_count' => (int) $sasaran->needs_count,
                ];
            })
            ->all();

        // Funding Source breakdown (via need_detail_funding_source)
        $fundingSources = DB::table('funding_sources')
            ->join('need_detail_funding_source', 'funding_sources.id', '=', 'need_detail_funding_source.funding_source_id')
            ->join('need_details', 'need_detail_funding_source.need_detail_id', '=', 'need_details.id')
            ->join('needs', 'need_details.need_id', '=', 'needs.id')
            ->where('needs.need_group_id', $groupId)
            ->when(! $user?->can('view any needs'), function ($q) use ($user) {
                if ($user?->can('view descendant needs') && $user->organizational_unit_id) {
                    $unit = $user->organizationalUnit;
                    if ($unit) {
                        $unit->loadMissing('descendantsRecursive');
                        $q->whereIn('needs.organizational_unit_id', $this->extractUnitIds($unit));
                    }
                } elseif ($user?->organizational_unit_id) {
                    $q->where('needs.organizational_unit_id', $user->organizational_unit_id);
                }
            })
            ->selectRaw('funding_sources.name, COUNT(DISTINCT needs.id) as needs_count, COALESCE(SUM(needs.total_price), 0) as total_budget')
            ->groupBy('funding_sources.id', 'funding_sources.name')
            ->orderByDesc('total_budget')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'needs_count' => (int) $row->needs_count,
                'total_budget' => (float) $row->total_budget,
            ])
            ->all();

        // 11. Checklist score histogram (Quality tab)
        $checklistBuckets = [
            '0-20' => (clone $baseQuery)->whereBetween('checklist_percentage', [0, 20])->count(),
            '21-40' => (clone $baseQuery)->whereBetween('checklist_percentage', [21, 40])->count(),
            '41-60' => (clone $baseQuery)->whereBetween('checklist_percentage', [41, 60])->count(),
            '61-80' => (clone $baseQuery)->whereBetween('checklist_percentage', [61, 80])->count(),
            '81-100' => (clone $baseQuery)->whereBetween('checklist_percentage', [81, 100])->count(),
        ];

        // 12. Own Unit KPIs (My Unit tab for unit heads / staff)
        $userUnitId = $user?->organizational_unit_id;
        $myUnitData = null;
        if ($userUnitId && isset($allUnits[$userUnitId])) {
            $myUnitQuery = Need::query()
                ->where('need_group_id', $groupId)
                ->where('organizational_unit_id', $userUnitId);

            $myUnitNeeds = $myUnitQuery->count();
            $myUnitBudget = (float) $myUnitQuery->sum('total_price');
            $myUnitApproved = (clone $myUnitQuery)->whereNotNull('approved_by_director_at')->count();
            $myUnitUnderReview = (clone $myUnitQuery)->where('status', 'approved')->whereNull('approved_by_director_at')->count();
            $myUnitDraft = (clone $myUnitQuery)->where('status', 'draft')->count();
            $myUnitRejected = (clone $myUnitQuery)->where('status', 'rejected')->count();
            $myUnitPriority = (clone $myUnitQuery)->where('is_priority', true)->count();

            $myUnitData = [
                'unit_id' => $userUnitId,
                'name' => $allUnits[$userUnitId]->name,
                'total_needs' => $myUnitNeeds,
                'total_budget' => $myUnitBudget,
                'approved_count' => $myUnitApproved,
                'under_review_count' => $myUnitUnderReview,
                'draft_count' => $myUnitDraft,
                'rejected_count' => $myUnitRejected,
                'priority_count' => $myUnitPriority,
            ];
        }

        // Available need groups for selector
        $availableGroups = NeedGroup::query()
            ->orderByDesc('year')
            ->orderByDesc('id')
            ->get(['id', 'name', 'year', 'is_active', 'submission_start_at', 'submission_end_at'])
            ->map(function (NeedGroup $g): array {
                /** @var CarbonInterface|null $subEnd */
                $subEnd = $g->submission_end_at;

                return [
                    'id' => $g->id,
                    'name' => $g->name,
                    'year' => $g->year,
                    'is_active' => (bool) $g->is_active,
                    'window_status' => $g->getSubmissionWindowStatus(),
                    'submission_end_at' => $subEnd?->toIso8601String(),
                ];
            })
            ->all();
        $operations = $this->buildOperationsPayload(
            $currentGroup,
            $baseQuery,
            $user,
            $stats,
            $allUnitProgress,
            $now
        );

        return [
            'currentGroup' => $currentGroup ? [
                'id' => $currentGroup->id,
                'name' => $currentGroup->name,
                'year' => $currentGroup->year,
                'is_active' => (bool) $currentGroup->is_active,
                'window_status' => $currentGroup->getSubmissionWindowStatus(),
                'submission_end_at' => $currentGroup->submission_end_at,
            ] : null,
            'availableGroups' => $availableGroups,
            'stats' => $stats,
            'stageDistribution' => $stageDistribution,
            'statusDistribution' => $statusDistribution,
            'matrix' => $matrix,
            'decisionQueue' => $decisionQueue,
            'needsByUnit' => $needsByUnit,
            'needsByType' => $needsByType,
            'allUnitProgress' => $allUnitProgress,
            'dataReadiness' => $dataReadiness,
            'exceptions' => $exceptions,
            'activeUnlocks' => $activeUnlocks,
            'sasaranOverview' => $sasaranOverview,
            'fundingSources' => $fundingSources,
            'checklistBuckets' => $checklistBuckets,
            'myUnitData' => $myUnitData,
            'operations' => $operations,
        ];
    }

    /**
     * Legacy method for backwards compatibility with existing callers.
     */
    public function stats(int|string|null $groupId, ?NeedGroup $currentGroup = null, ?User $user = null): array
    {
        $payload = $this->getDashboardPayload($groupId, $user);

        return $payload['stats'] ?? [];
    }

    /**
     * Legacy method for backwards compatibility.
     */
    public function statusDistribution(int|string|null $groupId, ?User $user = null): array
    {
        $payload = $this->getDashboardPayload($groupId, $user);

        return $payload['statusDistribution'] ?? [];
    }

    /**
     * Legacy method for backwards compatibility.
     */
    public function byUnit(int|string|null $groupId, ?User $user = null): array
    {
        $payload = $this->getDashboardPayload($groupId, $user);

        return $payload['needsByUnit'] ?? [];
    }

    /**
     * Legacy method for backwards compatibility.
     */
    public function byType(int|string|null $groupId, ?User $user = null): array
    {
        $payload = $this->getDashboardPayload($groupId, $user);

        return $payload['needsByType'] ?? [];
    }

    /**
     * Build comprehensive Operations Command Center data (Variant B).
     *
     * @param  Builder<Need>  $baseQuery
     * @param  array<string, mixed>  $stats
     * @param  array<int, array<string, mixed>>  $allUnitProgress
     * @return array<string, mixed>
     */
    private function buildOperationsPayload(
        ?NeedGroup $currentGroup,
        Builder $baseQuery,
        ?User $user,
        array $stats,
        array &$allUnitProgress,
        CarbonImmutable $now
    ): array {
        // 1. Meta & Window calculation
        if (! $user || $user->can('view any needs')) {
            $scopeLabel = 'Seluruh Rumah Sakit';
        } elseif ($user->can('view descendant needs') && $user->organizationalUnit) {
            $scopeLabel = $user->organizationalUnit->name.' & Unit Bawahan';
        } else {
            $scopeLabel = $user->organizationalUnit->name ?? 'Unit Pengguna';
        }

        $subEnd = $currentGroup?->submission_end_at ? CarbonImmutable::parse($currentGroup->submission_end_at) : null;
        $startAtFormatted = $currentGroup?->submission_start_at ? CarbonImmutable::parse($currentGroup->submission_start_at)->format('d M Y') : null;
        $endAtFormatted = $currentGroup?->submission_end_at ? CarbonImmutable::parse($currentGroup->submission_end_at)->format('d M Y') : null;
        $daysRemaining = $subEnd ? (int) ceil($now->diffInDays($subEnd, false)) : null;
        $windowStatus = $currentGroup?->getSubmissionWindowStatus() ?? 'indefinite';

        // 2. Positive Queue: "Siap Diverifikasi"
        $positiveQueue = $this->exceptionCatalog->getPositiveQueue($baseQuery, $now);
        $readyCount = $positiveQueue['count'];
        $readyBudget = $positiveQueue['budget'];
        $readyNeeds = $positiveQueue['needs'];

        // 3. Exception Catalog E1..E9
        $exceptionItems = $this->exceptionCatalog->buildExceptionItems(
            $baseQuery,
            $currentGroup,
            $daysRemaining,
            $allUnitProgress,
            $now
        );

        $stageExceptions = $this->exceptionCatalog->computeStageExceptionCounts($baseQuery, $exceptionItems);
        $draftExceptionsCount = $stageExceptions['draft'];
        $reviewExceptionsCount = $stageExceptions['under_review'];
        $rejectedExceptionsCount = $stageExceptions['rejected'];

        $e9Item = collect($exceptionItems)->firstWhere('code', 'E9');
        $e9Count = (int) ($e9Item['count'] ?? 0);
        $e9Needs = $e9Item['needs'] ?? [];

        // 4. Lock Monitor
        $activeUnlocksCount = (int) (clone $baseQuery)->whereNotNull('unlocked_until')->where('unlocked_until', '>=', $now)->count();
        $manualLockedCount = (int) (clone $baseQuery)->where('is_locked', true)->whereNull('approved_by_director_at')->count();
        $directorLockedCount = (int) (clone $baseQuery)->whereNotNull('approved_by_director_at')->count();
        $isWindowClosed = $currentGroup && ! $currentGroup->isOpenForSubmission();
        $windowClosedLockedCount = $isWindowClosed
            ? (int) (clone $baseQuery)->whereNull('approved_by_director_at')->where('is_locked', '!=', false)->where(function ($q) use ($now) {
                $q->whereNull('unlocked_until')->orWhere('unlocked_until', '<', $now);
            })->count()
            : 0;

        $lockAnomalies = [];
        if ($e9Count > 0) {
            $lockAnomalies[] = [
                'type' => 'expiring_or_locked_draft',
                'title' => 'Anomali Kunci / Izin Buka Kunci Segera Kedaluwarsa',
                'description' => 'Terdapat usulan dengan dispensasi buka kunci berakhir <= 3 hari atau draf terkunci.',
                'count' => $e9Count,
                'needs' => $e9Needs,
            ];
        }

        // 5. Aging Histograms (idle days based on updated_at)
        $draftAging = [
            [
                'key' => 'fresh',
                'label' => '< 7 Hari',
                'description' => 'Aktivitas wajar',
                'count' => (int) (clone $baseQuery)->where('status', 'draft')->whereNull('approved_by_director_at')->where('updated_at', '>', $now->subDays(7))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'draft')->whereNull('approved_by_director_at')->where('updated_at', '>', $now->subDays(7))->sum('total_price'),
            ],
            [
                'key' => 'stale',
                'label' => '7 - 14 Hari',
                'description' => 'Perlu perhatian',
                'count' => (int) (clone $baseQuery)->where('status', 'draft')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(7))->where('updated_at', '>', $now->subDays(14))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'draft')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(7))->where('updated_at', '>', $now->subDays(14))->sum('total_price'),
            ],
            [
                'key' => 'delayed',
                'label' => '15 - 30 Hari',
                'description' => 'Tertahan lama',
                'count' => (int) (clone $baseQuery)->where('status', 'draft')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(14))->where('updated_at', '>', $now->subDays(30))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'draft')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(14))->where('updated_at', '>', $now->subDays(30))->sum('total_price'),
            ],
            [
                'key' => 'stuck',
                'label' => '> 30 Hari',
                'description' => 'Macet kritis',
                'count' => (int) (clone $baseQuery)->where('status', 'draft')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(30))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'draft')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(30))->sum('total_price'),
            ],
        ];

        $reviewAging = [
            [
                'key' => 'fresh',
                'label' => '< 5 Hari',
                'description' => 'Antrean baru',
                'count' => (int) (clone $baseQuery)->where('status', 'approved')->whereNull('approved_by_director_at')->where('updated_at', '>', $now->subDays(5))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'approved')->whereNull('approved_by_director_at')->where('updated_at', '>', $now->subDays(5))->sum('total_price'),
            ],
            [
                'key' => 'stale',
                'label' => '5 - 10 Hari',
                'description' => 'Mulai terlambat',
                'count' => (int) (clone $baseQuery)->where('status', 'approved')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(5))->where('updated_at', '>', $now->subDays(10))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'approved')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(5))->where('updated_at', '>', $now->subDays(10))->sum('total_price'),
            ],
            [
                'key' => 'delayed',
                'label' => '10 - 20 Hari',
                'description' => 'Tertahan verifikasi',
                'count' => (int) (clone $baseQuery)->where('status', 'approved')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(10))->where('updated_at', '>', $now->subDays(20))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'approved')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(10))->where('updated_at', '>', $now->subDays(20))->sum('total_price'),
            ],
            [
                'key' => 'stuck',
                'label' => '> 20 Hari',
                'description' => 'Macet verifikasi',
                'count' => (int) (clone $baseQuery)->where('status', 'approved')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(20))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'approved')->whereNull('approved_by_director_at')->where('updated_at', '<=', $now->subDays(20))->sum('total_price'),
            ],
        ];

        $rejectedAging = [
            [
                'key' => 'fresh',
                'label' => '< 7 Hari',
                'description' => 'Baru ditolak',
                'count' => (int) (clone $baseQuery)->where('status', 'rejected')->where('updated_at', '>', $now->subDays(7))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'rejected')->where('updated_at', '>', $now->subDays(7))->sum('total_price'),
            ],
            [
                'key' => 'stale',
                'label' => '7 - 14 Hari',
                'description' => 'Belum ada revisi',
                'count' => (int) (clone $baseQuery)->where('status', 'rejected')->where('updated_at', '<=', $now->subDays(7))->where('updated_at', '>', $now->subDays(14))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'rejected')->where('updated_at', '<=', $now->subDays(7))->where('updated_at', '>', $now->subDays(14))->sum('total_price'),
            ],
            [
                'key' => 'stuck',
                'label' => '> 14 Hari',
                'description' => 'Revisi terabaikan',
                'count' => (int) (clone $baseQuery)->where('status', 'rejected')->where('updated_at', '<=', $now->subDays(14))->count(),
                'budget' => (float) (clone $baseQuery)->where('status', 'rejected')->where('updated_at', '<=', $now->subDays(14))->sum('total_price'),
            ],
        ];

        // 6. Enrich Unit Progress with readiness and exceptions
        $sevenDaysAgo = $now->subDays(NeedExceptionCatalog::IDLE_DRAFT_DAYS);
        $fiveDaysAgo = $now->subDays(NeedExceptionCatalog::IDLE_REVIEW_DAYS);

        $unitNeedsStats = (clone $baseQuery)
            ->toBase()
            ->selectRaw('
                organizational_unit_id,
                AVG(CASE WHEN checklist_percentage > 0 THEN checklist_percentage ELSE 0 END) as avg_readiness,
                COUNT(CASE WHEN (status = \'draft\' AND updated_at <= \''.$sevenDaysAgo->toDateTimeString().'\')
                    OR (status = \'approved\' AND approved_by_director_at IS NULL AND updated_at <= \''.$fiveDaysAgo->toDateTimeString().'\')
                    OR (checklist_percentage > 0 AND checklist_percentage < 85) THEN 1 END) as exception_count
            ')
            ->groupBy('organizational_unit_id')
            ->get()
            ->keyBy('organizational_unit_id');

        foreach ($allUnitProgress as &$unitProg) {
            $uId = $unitProg['unit_id'];
            $stat = $unitNeedsStats->get($uId);
            $unitProg['exceptions_count'] = $stat ? (int) $stat->exception_count : 0;
            $unitProg['readiness'] = $stat ? round((float) $stat->avg_readiness, 1) : 0.0;
        }
        unset($unitProg);

        return [
            'meta' => [
                'scope_label' => $scopeLabel,
                'updated_at' => $now->toIso8601String(),
                'formatted_time' => $now->format('H:i').' WITA',
                'window_status' => $windowStatus,
                'window_start_at' => $startAtFormatted,
                'window_end_at' => $endAtFormatted,
                'days_remaining' => $daysRemaining,
            ],
            'stage_tiles' => [
                'draft' => [
                    'count' => $stats['draft_count'],
                    'budget' => $stats['draft_budget'],
                    'holder' => 'Unit Kerja',
                    'exceptions_count' => $draftExceptionsCount,
                ],
                'under_review' => [
                    'count' => $stats['awaiting_director'],
                    'budget' => $stats['awaiting_director_budget'],
                    'holder' => 'Tim Perencana / Direktur',
                    'exceptions_count' => $reviewExceptionsCount,
                ],
                'approved' => [
                    'count' => $stats['approved_by_director'],
                    'budget' => $stats['approved_budget'],
                    'holder' => 'Selesai',
                    'exceptions_count' => 0,
                ],
                'rejected' => [
                    'count' => $stats['rejected_count'],
                    'budget' => $stats['rejected_budget'],
                    'holder' => 'Unit Kerja (Revisi)',
                    'exceptions_count' => $rejectedExceptionsCount,
                ],
            ],
            'ready_for_verification' => [
                'count' => $readyCount,
                'budget' => $readyBudget,
                'needs' => $readyNeeds,
            ],
            'exceptions' => $exceptionItems,
            'lock_monitor' => [
                'timeline' => [
                    'status' => $windowStatus,
                    'start_at' => $startAtFormatted,
                    'end_at' => $endAtFormatted,
                    'days_remaining' => $daysRemaining,
                    'now_formatted' => $now->format('d M Y H:i').' WITA',
                ],
                'tier_counts' => [
                    'tier_2_extension' => $activeUnlocksCount,
                    'tier_3_manual' => $manualLockedCount,
                    'tier_4_director' => $directorLockedCount,
                    'tier_5_window' => $windowClosedLockedCount,
                    'total_locked' => $stats['locked_count'],
                ],
                'anomalies' => $lockAnomalies,
                'active_unlocks' => (clone $baseQuery)
                    ->whereNotNull('unlocked_until')
                    ->where('unlocked_until', '>=', $now)
                    ->with(['organizationalUnit:id,name', 'lockedByUser:id,name'])
                    ->orderBy('unlocked_until')
                    ->limit(15)
                    ->get()
                    ->map(function (Need $need) use ($user): array {
                        $unlockedUntil = $need->unlocked_until ? CarbonImmutable::parse($need->unlocked_until) : null;

                        return [
                            'id' => (int) $need->id,
                            'title' => (string) $need->title,
                            'unit_name' => $need->organizationalUnit->name ?? 'Unknown',
                            'unlocked_until' => $unlockedUntil?->toIso8601String(),
                            'lock_reason' => $need->lock_reason,
                            'can_lock' => $user?->can('lock', $need) ?? false,
                            'can_unlock' => $user?->can('unlock', $need) ?? false,
                        ];
                    })
                    ->all(),
            ],
            'aging' => [
                'draft' => $draftAging,
                'under_review' => $reviewAging,
                'rejected' => $rejectedAging,
            ],
            'unit_progress' => $allUnitProgress,
        ];
    }
}
