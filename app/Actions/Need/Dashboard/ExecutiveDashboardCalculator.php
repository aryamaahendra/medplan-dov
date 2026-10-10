<?php

declare(strict_types=1);

namespace App\Actions\Need\Dashboard;

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\Sasaran;
use App\Models\Tujuan;
use App\Models\User;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

class ExecutiveDashboardCalculator
{
    public function __construct(
        protected DashboardScopeResolver $scopeResolver
    ) {}

    /**
     * Compute Executive Dashboard metrics and foundational aggregations.
     *
     * @return array<string, mixed>
     */
    public function calculate(int $groupId, ?User $user, ?NeedGroup $currentGroup, ?NeedGroup $prevGroup): array
    {
        $baseQuery = Need::query()->where('need_group_id', $groupId);
        $this->scopeResolver->applyScope($baseQuery, $user);

        // 1. KPI & Overview Aggregates
        $stageCase = $this->scopeResolver->stageCaseSql();
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
                COALESCE(SUM(CASE WHEN is_priority = true AND {$stageCase} != 'rejected' THEN total_price ELSE 0 END), 0) as priority_budget,
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
            $this->scopeResolver->applyScope($prevQuery, $user);
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
            'priority_budget' => (float) ($aggregates->priority_budget ?? 0),
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
        $totalSubmittedBudget = $totalBudget + $stats['rejected_budget'];
        $stageDistribution = [
            'draft' => [
                'count' => $stats['draft_count'],
                'budget' => $stats['draft_budget'],
                'percentage' => $totalSubmittedBudget > 0 ? round(($stats['draft_budget'] / $totalSubmittedBudget) * 100, 1) : 0.0,
            ],
            'under_review' => [
                'count' => $stats['awaiting_director'],
                'budget' => $stats['awaiting_director_budget'],
                'percentage' => $totalSubmittedBudget > 0 ? round(($stats['awaiting_director_budget'] / $totalSubmittedBudget) * 100, 1) : 0.0,
            ],
            'approved' => [
                'count' => $stats['approved_by_director'],
                'budget' => $stats['approved_budget'],
                'percentage' => $totalSubmittedBudget > 0 ? round(($stats['approved_budget'] / $totalSubmittedBudget) * 100, 1) : 0.0,
            ],
            'rejected' => [
                'count' => $stats['rejected_count'],
                'budget' => $stats['rejected_budget'],
                'percentage' => $totalSubmittedBudget > 0 ? round(($stats['rejected_budget'] / $totalSubmittedBudget) * 100, 1) : 0.0,
            ],
        ];

        $statusDistribution = [
            'draft' => $stats['draft_count'],
            'under_review' => $stats['awaiting_director'],
            'approved' => $stats['approved_by_director'],
            'rejected' => $stats['rejected_count'],
        ];

        // 3. Priority Matrix 3x3
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

        // 4. Decision Queue
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

        // 5. Budget by Unit
        $unitAggregates = (clone $baseQuery)
            ->toBase()
            ->whereRaw("{$stageCase} != 'rejected'")
            ->selectRaw("
                organizational_unit_id,
                COUNT(*) as count,
                COALESCE(SUM(total_price), 0) as total_budget,
                COUNT(CASE WHEN is_priority = true THEN 1 END) as priority_count,
                COALESCE(SUM(CASE WHEN is_priority = true THEN total_price ELSE 0 END), 0) as priority_budget,
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
                'priority_budget' => (float) $item->priority_budget,
                'approved_count' => (int) $item->approved_count,
                'approved_budget' => (float) $item->approved_budget,
                'under_review_count' => (int) $item->under_review_count,
                'review_budget' => (float) $item->review_budget,
                'draft_count' => (int) $item->draft_count,
                'draft_budget' => (float) $item->draft_budget,
                'rejected_count' => (int) $item->rejected_count,
            ];
        })->values()->all();

        // 6. Unit Submission Progress
        $scopedUnits = $allUnits;
        if (! $user?->can('view any needs')) {
            if ($user?->can('view descendant needs') && $user->organizational_unit_id) {
                $allowedIds = $this->scopeResolver->extractUnitIds($user->organizationalUnit);
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

        // 7. Budget by Need Type
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

        // 8. Data Readiness
        $needsWithAttachmentsCount = (clone $baseQuery)->has('attachments')->count();
        $needsWithDetailCount = (clone $baseQuery)->has('detail')->count();
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

        // 9. High-level Exceptions summary
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

        $rejectedNotRevised = $stats['rejected_count'];
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

        // 10. Alignment & Renstra Analysis
        $sasaranOverview = Sasaran::query()
            ->withCount(['needs' => function ($q) use ($groupId, $user) {
                $q->where('need_group_id', $groupId);
                $this->scopeResolver->applyScope($q, $user);
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

        // Funding Source breakdown
        $fundingSources = DB::table('funding_sources')
            ->join('need_detail_funding_source', 'funding_sources.id', '=', 'need_detail_funding_source.funding_source_id')
            ->join('need_details', 'need_detail_funding_source.need_detail_id', '=', 'need_details.id')
            ->join('needs', 'need_details.need_id', '=', 'needs.id')
            ->where('needs.need_group_id', $groupId)
            ->whereNull('needs.deleted_at')
            ->where('needs.status', '!=', 'rejected')
            ->when(! $user?->can('view any needs'), function ($q) use ($user) {
                if ($user?->can('view descendant needs') && $user->organizational_unit_id) {
                    $unit = $user->organizationalUnit;
                    if ($unit) {
                        $unit->loadMissing('descendantsRecursive');
                        $q->whereIn('needs.organizational_unit_id', $this->scopeResolver->extractUnitIds($unit));
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

        // 11. Checklist score histogram
        /** @var object{b1?: int|string, b2?: int|string, b3?: int|string, b4?: int|string, b5?: int|string}|null $clBuckets */
        $clBuckets = (clone $baseQuery)
            ->toBase()
            ->selectRaw('
                COUNT(CASE WHEN checklist_percentage BETWEEN 0 AND 20 THEN 1 END) as b1,
                COUNT(CASE WHEN checklist_percentage BETWEEN 21 AND 40 THEN 1 END) as b2,
                COUNT(CASE WHEN checklist_percentage BETWEEN 41 AND 60 THEN 1 END) as b3,
                COUNT(CASE WHEN checklist_percentage BETWEEN 61 AND 80 THEN 1 END) as b4,
                COUNT(CASE WHEN checklist_percentage BETWEEN 81 AND 100 THEN 1 END) as b5
            ')
            ->first();

        $checklistBuckets = [
            '0-20' => (int) ($clBuckets->b1 ?? 0),
            '21-40' => (int) ($clBuckets->b2 ?? 0),
            '41-60' => (int) ($clBuckets->b3 ?? 0),
            '61-80' => (int) ($clBuckets->b4 ?? 0),
            '81-100' => (int) ($clBuckets->b5 ?? 0),
        ];

        // 12. Own Unit KPIs
        $userUnitId = $user?->organizational_unit_id;
        $myUnitData = null;
        if ($userUnitId && isset($allUnits[$userUnitId])) {
            /** @var object{total_needs?: int|string, total_budget?: int|float|string, approved_count?: int|string, under_review_count?: int|string, draft_count?: int|string, rejected_count?: int|string, priority_count?: int|string}|null $myUnitRow */
            $myUnitRow = Need::query()
                ->where('need_group_id', $groupId)
                ->where('organizational_unit_id', $userUnitId)
                ->toBase()
                ->selectRaw("
                    COUNT(*) as total_needs,
                    COALESCE(SUM(total_price), 0) as total_budget,
                    COUNT(CASE WHEN approved_by_director_at IS NOT NULL THEN 1 END) as approved_count,
                    COUNT(CASE WHEN status = 'approved' AND approved_by_director_at IS NULL THEN 1 END) as under_review_count,
                    COUNT(CASE WHEN {$stageCase} = 'draft' THEN 1 END) as draft_count,
                    COUNT(CASE WHEN {$stageCase} = 'rejected' THEN 1 END) as rejected_count,
                    COUNT(CASE WHEN is_priority = true THEN 1 END) as priority_count
                ")
                ->first();

            $myUnitData = [
                'unit_id' => $userUnitId,
                'name' => $allUnits[$userUnitId]->name,
                'total_needs' => (int) ($myUnitRow->total_needs ?? 0),
                'total_budget' => (float) ($myUnitRow->total_budget ?? 0),
                'approved_count' => (int) ($myUnitRow->approved_count ?? 0),
                'under_review_count' => (int) ($myUnitRow->under_review_count ?? 0),
                'draft_count' => (int) ($myUnitRow->draft_count ?? 0),
                'rejected_count' => (int) ($myUnitRow->rejected_count ?? 0),
                'priority_count' => (int) ($myUnitRow->priority_count ?? 0),
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
        /** @var object{b1?: int|string, b2?: int|string, b3?: int|string, b4?: int|string, b5?: int|string}|null $sbRow */
        $sbRow = (clone $baseQuery)
            ->toBase()
            ->whereRaw("{$stageCase} != 'rejected'")
            ->selectRaw('
                COUNT(CASE WHEN total_price < 10000000 THEN 1 END) as b1,
                COUNT(CASE WHEN total_price >= 10000000 AND total_price <= 50000000 THEN 1 END) as b2,
                COUNT(CASE WHEN total_price > 50000000 AND total_price <= 200000000 THEN 1 END) as b3,
                COUNT(CASE WHEN total_price > 200000000 AND total_price <= 1000000000 THEN 1 END) as b4,
                COUNT(CASE WHEN total_price > 1000000000 THEN 1 END) as b5
            ')
            ->first();

        $sizeBuckets = [
            '< 10 Juta' => (int) ($sbRow->b1 ?? 0),
            '10 - 50 Juta' => (int) ($sbRow->b2 ?? 0),
            '50 - 200 Juta' => (int) ($sbRow->b3 ?? 0),
            '200 Jt - 1 Milyar' => (int) ($sbRow->b4 ?? 0),
            '> 1 Milyar' => (int) ($sbRow->b5 ?? 0),
        ];

        $unitTypeRows = (clone $baseQuery)
            ->toBase()
            ->whereRaw("{$stageCase} != 'rejected'")
            ->selectRaw('organizational_unit_id, need_type_id, COALESCE(SUM(total_price), 0) as budget')
            ->groupBy('organizational_unit_id', 'need_type_id')
            ->get();

        $unitTypeMatrix = [];
        foreach ($unitTypeRows as $r) {
            $unitTypeMatrix["{$r->organizational_unit_id}_{$r->need_type_id}"] = (float) $r->budget;
        }

        return [
            'baseQuery' => $baseQuery,
            'now' => $now,
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
            'sizeBuckets' => $sizeBuckets,
            'unitTypeMatrix' => $unitTypeMatrix,
            'availableGroups' => $availableGroups,
        ];
    }
}
