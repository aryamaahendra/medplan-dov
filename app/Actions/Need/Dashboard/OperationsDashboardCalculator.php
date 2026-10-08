<?php

declare(strict_types=1);

namespace App\Actions\Need\Dashboard;

use App\Actions\Need\NeedExceptionCatalog;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class OperationsDashboardCalculator
{
    public function __construct(
        protected NeedExceptionCatalog $exceptionCatalog
    ) {}

    /**
     * Build comprehensive Operations Command Center data (Variant B).
     *
     * @param  Builder<Need>  $baseQuery
     * @param  array<string, mixed>  $stats
     * @param  array<int, array<string, mixed>>  $allUnitProgress
     * @return array<string, mixed>
     */
    public function calculate(
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
