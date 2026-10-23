<?php

declare(strict_types=1);

namespace App\Actions\Need\Dashboard;

use App\Exceptions\Need\NeedExceptionCatalog;
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
        /** @var object{c_unlock?: int|string, c_manual?: int|string, c_director?: int|string, c_window?: int|string}|null $lockRow */
        $lockRow = (clone $baseQuery)
            ->toBase()
            ->selectRaw('
                COUNT(CASE WHEN unlocked_until IS NOT NULL AND unlocked_until >= ? THEN 1 END) as c_unlock,
                COUNT(CASE WHEN is_locked = true AND approved_by_director_at IS NULL THEN 1 END) as c_manual,
                COUNT(CASE WHEN approved_by_director_at IS NOT NULL THEN 1 END) as c_director,
                COUNT(CASE WHEN approved_by_director_at IS NULL AND is_locked != false AND (unlocked_until IS NULL OR unlocked_until < ?) THEN 1 END) as c_window
            ', [$now, $now])
            ->first();

        $activeUnlocksCount = (int) ($lockRow->c_unlock ?? 0);
        $manualLockedCount = (int) ($lockRow->c_manual ?? 0);
        $directorLockedCount = (int) ($lockRow->c_director ?? 0);
        $isWindowClosed = $currentGroup && ! $currentGroup->isOpenForSubmission();
        $windowClosedLockedCount = $isWindowClosed ? (int) ($lockRow->c_window ?? 0) : 0;

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
        $sub7 = $now->subDays(7);
        $sub14 = $now->subDays(14);
        $sub30 = $now->subDays(30);

        /** @var object{c1?: int|string, b1?: int|float|string, c2?: int|string, b2?: int|float|string, c3?: int|string, b3?: int|float|string, c4?: int|string, b4?: int|float|string}|null $dAging */
        $dAging = (clone $baseQuery)
            ->toBase()
            ->where('status', 'draft')
            ->whereNull('approved_by_director_at')
            ->selectRaw('
                COUNT(CASE WHEN updated_at > ? THEN 1 END) as c1,
                COALESCE(SUM(CASE WHEN updated_at > ? THEN total_price ELSE 0 END), 0) as b1,
                COUNT(CASE WHEN updated_at <= ? AND updated_at > ? THEN 1 END) as c2,
                COALESCE(SUM(CASE WHEN updated_at <= ? AND updated_at > ? THEN total_price ELSE 0 END), 0) as b2,
                COUNT(CASE WHEN updated_at <= ? AND updated_at > ? THEN 1 END) as c3,
                COALESCE(SUM(CASE WHEN updated_at <= ? AND updated_at > ? THEN total_price ELSE 0 END), 0) as b3,
                COUNT(CASE WHEN updated_at <= ? THEN 1 END) as c4,
                COALESCE(SUM(CASE WHEN updated_at <= ? THEN total_price ELSE 0 END), 0) as b4
            ', [$sub7, $sub7, $sub7, $sub14, $sub7, $sub14, $sub14, $sub30, $sub14, $sub30, $sub30, $sub30])
            ->first();

        $draftAging = [
            ['key' => 'fresh', 'label' => '< 7 Hari', 'description' => 'Aktivitas wajar', 'count' => (int) ($dAging->c1 ?? 0), 'budget' => (float) ($dAging->b1 ?? 0)],
            ['key' => 'stale', 'label' => '7 - 14 Hari', 'description' => 'Perlu perhatian', 'count' => (int) ($dAging->c2 ?? 0), 'budget' => (float) ($dAging->b2 ?? 0)],
            ['key' => 'delayed', 'label' => '15 - 30 Hari', 'description' => 'Tertahan lama', 'count' => (int) ($dAging->c3 ?? 0), 'budget' => (float) ($dAging->b3 ?? 0)],
            ['key' => 'stuck', 'label' => '> 30 Hari', 'description' => 'Macet kritis', 'count' => (int) ($dAging->c4 ?? 0), 'budget' => (float) ($dAging->b4 ?? 0)],
        ];

        $sub5 = $now->subDays(5);
        $sub10 = $now->subDays(10);
        $sub20 = $now->subDays(20);

        /** @var object{c1?: int|string, b1?: int|float|string, c2?: int|string, b2?: int|float|string, c3?: int|string, b3?: int|float|string, c4?: int|string, b4?: int|float|string}|null $rAging */
        $rAging = (clone $baseQuery)
            ->toBase()
            ->where(function ($q) {
                $q->where('status', Need::STATUS_SUBMITTED)
                    ->orWhere(function ($legacy) {
                        $legacy->where('status', Need::STATUS_APPROVED)
                            ->whereNull('approved_by_director_at');
                    });
            })
            ->selectRaw('
                COUNT(CASE WHEN updated_at > ? THEN 1 END) as c1,
                COALESCE(SUM(CASE WHEN updated_at > ? THEN total_price ELSE 0 END), 0) as b1,
                COUNT(CASE WHEN updated_at <= ? AND updated_at > ? THEN 1 END) as c2,
                COALESCE(SUM(CASE WHEN updated_at <= ? AND updated_at > ? THEN total_price ELSE 0 END), 0) as b2,
                COUNT(CASE WHEN updated_at <= ? AND updated_at > ? THEN 1 END) as c3,
                COALESCE(SUM(CASE WHEN updated_at <= ? AND updated_at > ? THEN total_price ELSE 0 END), 0) as b3,
                COUNT(CASE WHEN updated_at <= ? THEN 1 END) as c4,
                COALESCE(SUM(CASE WHEN updated_at <= ? THEN total_price ELSE 0 END), 0) as b4
            ', [$sub5, $sub5, $sub5, $sub10, $sub5, $sub10, $sub10, $sub20, $sub10, $sub20, $sub20, $sub20])
            ->first();

        $reviewAging = [
            ['key' => 'fresh', 'label' => '< 5 Hari', 'description' => 'Antrean baru', 'count' => (int) ($rAging->c1 ?? 0), 'budget' => (float) ($rAging->b1 ?? 0)],
            ['key' => 'stale', 'label' => '5 - 10 Hari', 'description' => 'Mulai terlambat', 'count' => (int) ($rAging->c2 ?? 0), 'budget' => (float) ($rAging->b2 ?? 0)],
            ['key' => 'delayed', 'label' => '10 - 20 Hari', 'description' => 'Tertahan verifikasi', 'count' => (int) ($rAging->c3 ?? 0), 'budget' => (float) ($rAging->b3 ?? 0)],
            ['key' => 'stuck', 'label' => '> 20 Hari', 'description' => 'Macet verifikasi', 'count' => (int) ($rAging->c4 ?? 0), 'budget' => (float) ($rAging->b4 ?? 0)],
        ];

        /** @var object{c1?: int|string, b1?: int|float|string, c2?: int|string, b2?: int|float|string, c3?: int|string, b3?: int|float|string}|null $rejAging */
        $rejAging = (clone $baseQuery)
            ->toBase()
            ->where('status', 'rejected')
            ->selectRaw('
                COUNT(CASE WHEN updated_at > ? THEN 1 END) as c1,
                COALESCE(SUM(CASE WHEN updated_at > ? THEN total_price ELSE 0 END), 0) as b1,
                COUNT(CASE WHEN updated_at <= ? AND updated_at > ? THEN 1 END) as c2,
                COALESCE(SUM(CASE WHEN updated_at <= ? AND updated_at > ? THEN total_price ELSE 0 END), 0) as b2,
                COUNT(CASE WHEN updated_at <= ? THEN 1 END) as c3,
                COALESCE(SUM(CASE WHEN updated_at <= ? THEN total_price ELSE 0 END), 0) as b3
            ', [$sub7, $sub7, $sub7, $sub14, $sub7, $sub14, $sub14, $sub14])
            ->first();

        $rejectedAging = [
            ['key' => 'fresh', 'label' => '< 7 Hari', 'description' => 'Baru ditolak', 'count' => (int) ($rejAging->c1 ?? 0), 'budget' => (float) ($rejAging->b1 ?? 0)],
            ['key' => 'stale', 'label' => '7 - 14 Hari', 'description' => 'Belum ada revisi', 'count' => (int) ($rejAging->c2 ?? 0), 'budget' => (float) ($rejAging->b2 ?? 0)],
            ['key' => 'stuck', 'label' => '> 14 Hari', 'description' => 'Revisi terabaikan', 'count' => (int) ($rejAging->c3 ?? 0), 'budget' => (float) ($rejAging->b3 ?? 0)],
        ];

        // 6. Enrich Unit Progress with readiness and exceptions
        $sevenDaysAgo = $now->subDays(NeedExceptionCatalog::IDLE_DRAFT_DAYS);
        $fiveDaysAgo = $now->subDays(NeedExceptionCatalog::IDLE_REVIEW_DAYS);

        $unitNeedsStats = (clone $baseQuery)
            ->toBase()
            ->selectRaw("
                organizational_unit_id,
                AVG(CASE WHEN checklist_percentage > 0 THEN checklist_percentage ELSE 0 END) as avg_readiness,
                COUNT(CASE WHEN (status = 'draft' AND updated_at <= '{$sevenDaysAgo->toDateTimeString()}')
                    OR ((status = 'submitted' OR (status = 'approved' AND approved_by_director_at IS NULL)) AND updated_at <= '{$fiveDaysAgo->toDateTimeString()}')
                    OR (checklist_percentage > 0 AND checklist_percentage < 85) THEN 1 END) as exception_count
            ")
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
