<?php

declare(strict_types=1);

namespace App\Exceptions\Need;

use App\Models\Need;
use App\Models\NeedGroup;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

/**
 * Deep module encapsulating institutional exception rules, operational aging thresholds,
 * attention query filtering, and drawer telemetry formatting.
 */
class NeedExceptionCatalog
{
    public const int IDLE_DRAFT_DAYS = 7;

    public const int IDLE_REVIEW_DAYS = 5;

    public const int IDLE_REVIEW_CRITICAL_DAYS = 10;

    public const int IDLE_REJECTED_DAYS = 7;

    public const int SUBMISSION_CLOSING_DAYS = 7;

    public const int REVISION_CLOSING_DAYS = 3;

    public const float MIN_CHECKLIST_PERCENTAGE = 85.0;

    /**
     * Apply attention and exception filters to a Need query with deterministic, immutable dates.
     *
     * @param  Builder<Need>  $query
     * @param  array<int, string>  $keys
     * @return Builder<Need>
     */
    public function applyAttentionScope(Builder $query, array $keys, ?CarbonImmutable $referenceTime = null): Builder
    {
        $keys = array_values(array_filter($keys));
        if (empty($keys)) {
            return $query;
        }

        $now = $referenceTime ?? CarbonImmutable::now('Asia/Makassar');
        $sevenDaysAgo = $now->subDays(self::IDLE_DRAFT_DAYS);
        $fiveDaysAgo = $now->subDays(self::IDLE_REVIEW_DAYS);
        $submissionClosingBound = $now->addDays(self::SUBMISSION_CLOSING_DAYS);
        $threeDaysAhead = $now->addDays(self::REVISION_CLOSING_DAYS);

        return $query->where(function (Builder $sub) use (
            $keys,
            $now,
            $sevenDaysAgo,
            $fiveDaysAgo,
            $submissionClosingBound,
            $threeDaysAhead
        ) {
            foreach ($keys as $key) {
                if ($key === 'E1' || $key === 'submission_closing') {
                    $sub->orWhere(function (Builder $s) use ($now, $submissionClosingBound) {
                        $s->where('status', 'draft')
                            ->whereNull('approved_by_director_at')
                            ->whereHas('needGroup', fn (Builder $g) => $g->whereNotNull('submission_end_at')
                                ->where('submission_end_at', '>=', $now)
                                ->where('submission_end_at', '<=', $submissionClosingBound));
                    });
                } elseif ($key === 'E2' || $key === 'draft_idle') {
                    $sub->orWhere(function (Builder $s) use ($sevenDaysAgo) {
                        $s->where('status', 'draft')
                            ->whereNull('approved_by_director_at')
                            ->where('updated_at', '<=', $sevenDaysAgo);
                    });
                } elseif ($key === 'E3' || $key === 'low_checklist') {
                    $sub->orWhere(function (Builder $s) {
                        $s->where('checklist_percentage', '>', 0)
                            ->where('checklist_percentage', '<', self::MIN_CHECKLIST_PERCENTAGE)
                            ->whereNull('approved_by_director_at');
                    });
                } elseif ($key === 'E4' || $key === 'unassessed_review') {
                    $sub->orWhere(function (Builder $s) {
                        $s->where(function (Builder $q) {
                            $q->where('status', Need::STATUS_SUBMITTED)
                                ->orWhere(function (Builder $legacy) {
                                    $legacy->where('status', Need::STATUS_APPROVED)
                                        ->whereNull('approved_by_director_at');
                                });
                        })->where(function (Builder $subCheck) {
                            $subCheck->where('checklist_percentage', 0)
                                ->orWhereNull('checklist_percentage');
                        });
                    });
                } elseif ($key === 'E5' || $key === 'review_idle') {
                    $sub->orWhere(function (Builder $s) use ($fiveDaysAgo) {
                        $s->where(function (Builder $q) {
                            $q->where('status', Need::STATUS_SUBMITTED)
                                ->orWhere(function (Builder $legacy) {
                                    $legacy->where('status', Need::STATUS_APPROVED)
                                        ->whereNull('approved_by_director_at');
                                });
                        })->where('updated_at', '<=', $fiveDaysAgo);
                    });
                } elseif ($key === 'E6' || $key === 'missing_linkage') {
                    $sub->orWhere(function (Builder $s) {
                        $s->where(function (Builder $q) {
                            $q->where('status', Need::STATUS_SUBMITTED)
                                ->orWhere(function (Builder $legacy) {
                                    $legacy->where('status', Need::STATUS_APPROVED)
                                        ->whereNull('approved_by_director_at');
                                });
                        })->where(function (Builder $linkSub) {
                            $linkSub->doesntHave('attachments')
                                ->orDoesntHave('sasarans')
                                ->orDoesntHave('indicators')
                                ->orDoesntHave('kpiIndicators')
                                ->orDoesntHave('strategicServicePlans');
                        });
                    });
                } elseif ($key === 'E7' || $key === 'rejected_idle') {
                    $sub->orWhere(function (Builder $s) use ($sevenDaysAgo) {
                        $s->where('status', 'rejected')
                            ->where('updated_at', '<=', $sevenDaysAgo);
                    });
                } elseif ($key === 'E9' || $key === 'revision_closing') {
                    $sub->orWhere(function (Builder $s) use ($now, $threeDaysAhead) {
                        $s->where(function (Builder $sub1) use ($now, $threeDaysAhead) {
                            $sub1->whereNotNull('unlocked_until')
                                ->where('unlocked_until', '>=', $now)
                                ->where('unlocked_until', '<=', $threeDaysAhead);
                        })->orWhere(function (Builder $sub2) {
                            $sub2->where('is_locked', true)
                                ->where('status', 'draft')
                                ->where('checklist_percentage', '<', self::MIN_CHECKLIST_PERCENTAGE);
                        });
                    });
                } elseif ($key === 'ready_for_verification') {
                    $sub->orWhere(function (Builder $s) {
                        $s->where('status', 'draft')
                            ->whereNull('approved_by_director_at')
                            ->where('checklist_percentage', '>=', self::MIN_CHECKLIST_PERCENTAGE)
                            ->has('attachments')
                            ->has('sasarans')
                            ->has('indicators')
                            ->has('kpiIndicators')
                            ->has('strategicServicePlans');
                    });
                } elseif ($key === 'has_notes') {
                    $sub->orWhereNotNull('notes');
                } elseif ($key === 'priority_only') {
                    $sub->orWhere('is_priority', true);
                }
            }
        });
    }

    /**
     * Build the "Siap Diverifikasi" positive queue for operations command center.
     *
     * @param  Builder<Need>  $baseQuery
     * @return array{count: int, budget: float, needs: array<int, array<string, mixed>>}
     */
    public function getPositiveQueue(Builder $baseQuery, CarbonImmutable $now): array
    {
        $readyQuery = (clone $baseQuery)
            ->where('status', Need::STATUS_DRAFT)
            ->whereNull('approved_by_director_at')
            ->where('checklist_percentage', '>=', self::MIN_CHECKLIST_PERCENTAGE)
            ->has('attachments')
            ->has('sasarans')
            ->has('indicators')
            ->has('kpiIndicators')
            ->has('strategicServicePlans');

        $readyStat = (clone $readyQuery)->toBase()->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as budget')->first();

        return [
            'count' => (int) ($readyStat->count ?? 0),
            'budget' => (float) ($readyStat->budget ?? 0),
            'needs' => (clone $readyQuery)
                ->with(['organizationalUnit:id,name'])
                ->orderByDesc('total_price')
                ->limit(10)
                ->get()
                ->map(fn (Need $n): array => $this->formatNeedForDrawer($n, $now))
                ->all(),
        ];
    }

    /**
     * Build the complete 9-item exception catalog collection for the Operations Command Center.
     *
     * @param  Builder<Need>  $baseQuery
     * @param  array<int, array<string, mixed>>  $allUnitProgress
     * @return array<int, array<string, mixed>>
     */
    public function buildExceptionItems(
        Builder $baseQuery,
        ?NeedGroup $currentGroup,
        ?int $daysRemaining,
        array $allUnitProgress,
        CarbonImmutable $now
    ): array {
        $sevenDaysAgo = $now->subDays(self::IDLE_DRAFT_DAYS);
        $fiveDaysAgo = $now->subDays(self::IDLE_REVIEW_DAYS);
        $tenDaysAgo = $now->subDays(self::IDLE_REVIEW_CRITICAL_DAYS);
        $threeDaysAhead = $now->addDays(self::REVISION_CLOSING_DAYS);

        // E1: Window closing soon while draft exists
        $isE1Active = $currentGroup && $currentGroup->isOpenForSubmission() && $daysRemaining !== null && $daysRemaining <= self::SUBMISSION_CLOSING_DAYS && $daysRemaining >= 0;
        $e1Severity = ($daysRemaining !== null && $daysRemaining <= self::REVISION_CLOSING_DAYS) ? 'critical' : 'warning';
        $e1NeedsQuery = $isE1Active
            ? (clone $baseQuery)->where('status', 'draft')->whereNull('approved_by_director_at')
            : null;
        $e1Stat = $e1NeedsQuery ? (clone $e1NeedsQuery)->toBase()->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as budget')->first() : null;
        $e1Count = (int) ($e1Stat->count ?? 0);
        $e1Budget = (float) ($e1Stat->budget ?? 0.0);
        $e1Needs = $e1NeedsQuery
            ? (clone $e1NeedsQuery)->with('organizationalUnit:id,name')->orderByDesc('total_price')->limit(10)->get()->map(fn (Need $n): array => $this->formatNeedForDrawer($n, $now))->all()
            : [];

        // E2: Draft idle >= 7 days
        $e2Query = (clone $baseQuery)->where('status', 'draft')->whereNull('approved_by_director_at')->where('updated_at', '<=', $sevenDaysAgo);
        $e2Stat = (clone $e2Query)->toBase()->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as budget')->first();
        $e2Count = (int) ($e2Stat->count ?? 0);
        $e2Budget = (float) ($e2Stat->budget ?? 0.0);
        $e2Needs = (clone $e2Query)->with('organizationalUnit:id,name')->orderBy('updated_at')->limit(10)->get()->map(fn (Need $n): array => $this->formatNeedForDrawer($n, $now))->all();

        // E3: Assessed need with checklist < 85%
        $e3Query = (clone $baseQuery)->where('checklist_percentage', '>', 0)->where('checklist_percentage', '<', self::MIN_CHECKLIST_PERCENTAGE)->whereNull('approved_by_director_at');
        $e3Stat = (clone $e3Query)->toBase()->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as budget')->first();
        $e3Count = (int) ($e3Stat->count ?? 0);
        $e3Budget = (float) ($e3Stat->budget ?? 0.0);
        $e3Needs = (clone $e3Query)->with('organizationalUnit:id,name')->orderBy('checklist_percentage')->limit(10)->get()->map(fn (Need $n): array => $this->formatNeedForDrawer($n, $now))->all();

        // E4: Under review with 0% checklist
        $e4Query = (clone $baseQuery)->where(function (Builder $q) {
            $q->where('status', Need::STATUS_SUBMITTED)
                ->orWhere(function (Builder $legacy) {
                    $legacy->where('status', Need::STATUS_APPROVED)->whereNull('approved_by_director_at');
                });
        })->where(function (Builder $q) {
            $q->whereNull('checklist_percentage')->orWhere('checklist_percentage', 0);
        });
        $e4Stat = (clone $e4Query)->toBase()->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as budget')->first();
        $e4Count = (int) ($e4Stat->count ?? 0);
        $e4Budget = (float) ($e4Stat->budget ?? 0.0);
        $e4Needs = (clone $e4Query)->with('organizationalUnit:id,name')->orderByDesc('total_price')->limit(10)->get()->map(fn (Need $n): array => $this->formatNeedForDrawer($n, $now))->all();

        // E5: Under review idle >= 5 days (Critical at >= 10 days)
        $e5Query = (clone $baseQuery)->where(function (Builder $q) {
            $q->where('status', Need::STATUS_SUBMITTED)
                ->orWhere(function (Builder $legacy) {
                    $legacy->where('status', Need::STATUS_APPROVED)->whereNull('approved_by_director_at');
                });
        })->where('updated_at', '<=', $fiveDaysAgo);
        $e5Stat = (clone $e5Query)->toBase()->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as budget')->first();
        $e5Count = (int) ($e5Stat->count ?? 0);
        $e5Budget = (float) ($e5Stat->budget ?? 0.0);
        $e5CriticalCount = (clone $baseQuery)->where(function (Builder $q) {
            $q->where('status', Need::STATUS_SUBMITTED)
                ->orWhere(function (Builder $legacy) {
                    $legacy->where('status', Need::STATUS_APPROVED)->whereNull('approved_by_director_at');
                });
        })->where('updated_at', '<=', $tenDaysAgo)->count();
        $e5Severity = $e5CriticalCount > 0 ? 'critical' : 'warning';
        $e5Needs = (clone $e5Query)->with('organizationalUnit:id,name')->orderBy('updated_at')->limit(10)->get()->map(fn (Need $n): array => $this->formatNeedForDrawer($n, $now))->all();

        // E6: Under review missing mandatory linkages
        $e6Query = (clone $baseQuery)->where(function (Builder $q) {
            $q->where('status', Need::STATUS_SUBMITTED)
                ->orWhere(function (Builder $legacy) {
                    $legacy->where('status', Need::STATUS_APPROVED)->whereNull('approved_by_director_at');
                });
        })->where(function (Builder $q) {
            $q->doesntHave('attachments')
                ->orDoesntHave('sasarans')
                ->orDoesntHave('indicators')
                ->orDoesntHave('kpiIndicators')
                ->orDoesntHave('strategicServicePlans');
        });
        $e6Stat = (clone $e6Query)->toBase()->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as budget')->first();
        $e6Count = (int) ($e6Stat->count ?? 0);
        $e6Budget = (float) ($e6Stat->budget ?? 0.0);
        $e6Needs = (clone $e6Query)->with('organizationalUnit:id,name')->orderByDesc('total_price')->limit(10)->get()->map(fn (Need $n): array => $this->formatNeedForDrawer($n, $now))->all();

        // E7: Rejected idle >= 7 days
        $e7Query = (clone $baseQuery)->where('status', 'rejected')->where('updated_at', '<=', $sevenDaysAgo);
        $e7Stat = (clone $e7Query)->toBase()->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as budget')->first();
        $e7Count = (int) ($e7Stat->count ?? 0);
        $e7Budget = (float) ($e7Stat->budget ?? 0.0);
        $e7Needs = (clone $e7Query)->with('organizationalUnit:id,name')->orderBy('updated_at')->limit(10)->get()->map(fn (Need $n): array => $this->formatNeedForDrawer($n, $now))->all();

        // E8: Zero submission units
        $zeroUnits = collect($allUnitProgress)->where('has_submission', false)->values();
        $e8Count = $zeroUnits->count();
        $e8Severity = ($daysRemaining !== null && $daysRemaining <= self::REVISION_CLOSING_DAYS) ? 'critical' : 'warning';

        // E9: Lock anomalies (expiring unlock <= 3 days, or locked draft with low checklist)
        $e9Query = (clone $baseQuery)->where(function (Builder $q) use ($now, $threeDaysAhead) {
            $q->where(function (Builder $sub1) use ($now, $threeDaysAhead) {
                $sub1->whereNotNull('unlocked_until')->where('unlocked_until', '>=', $now)->where('unlocked_until', '<=', $threeDaysAhead);
            })->orWhere(function (Builder $sub2) {
                $sub2->where('is_locked', true)->where('status', 'draft')->where('checklist_percentage', '<', self::MIN_CHECKLIST_PERCENTAGE);
            });
        });
        $e9Stat = (clone $e9Query)->toBase()->selectRaw('COUNT(*) as count, COALESCE(SUM(total_price), 0) as budget')->first();
        $e9Count = (int) ($e9Stat->count ?? 0);
        $e9Budget = (float) ($e9Stat->budget ?? 0.0);
        $e9Needs = (clone $e9Query)->with('organizationalUnit:id,name')->orderBy('unlocked_until')->limit(10)->get()->map(fn (Need $n): array => $this->formatNeedForDrawer($n, $now))->all();

        return [
            [
                'code' => 'E1',
                'title' => 'Draf Mendekati Batas Akhir Siklus',
                'description' => 'Usulan masih berupa draf padahal jadwal pengajuan akan ditutup dalam waktu dekat.',
                'severity' => $e1Severity,
                'count' => $e1Count,
                'budget' => $e1Budget,
                'stage' => 'draft',
                'query_filter' => ['status' => ['draft'], 'attention' => ['E1']],
                'needs' => $e1Needs,
            ],
            [
                'code' => 'E2',
                'title' => 'Draf Tidak Aktif >= 7 Hari',
                'description' => 'Draf belum diperbarui oleh unit kerja selama 7 hari atau lebih.',
                'severity' => 'warning',
                'count' => $e2Count,
                'budget' => $e2Budget,
                'stage' => 'draft',
                'query_filter' => ['status' => ['draft'], 'attention' => ['E2']],
                'needs' => $e2Needs,
            ],
            [
                'code' => 'E3',
                'title' => 'Skor Checklist < 85% (Perlu Kelengkapan)',
                'description' => 'Usulan telah dinilai tetapi skor instrumen checklist belum mencapai standar kelayakan 85%.',
                'severity' => 'warning',
                'count' => $e3Count,
                'budget' => $e3Budget,
                'stage' => 'draft',
                'query_filter' => ['attention' => ['E3']],
                'needs' => $e3Needs,
            ],
            [
                'code' => 'E4',
                'title' => 'Menunggu Review Belum Dinilai Checklist',
                'description' => 'Usulan telah diajukan ke tahap review namun skor checklist masih kosong (0%).',
                'severity' => 'warning',
                'count' => $e4Count,
                'budget' => $e4Budget,
                'stage' => 'under_review',
                'query_filter' => ['stage' => ['under_review'], 'attention' => ['E4']],
                'needs' => $e4Needs,
            ],
            [
                'code' => 'E5',
                'title' => 'Menunggu Review Tertahan >= 5 Hari',
                'description' => 'Usulan dalam tahap review belum ditindaklanjuti oleh reviewer atau direktur selama 5 hari atau lebih.',
                'severity' => $e5Severity,
                'count' => $e5Count,
                'budget' => $e5Budget,
                'stage' => 'under_review',
                'query_filter' => ['stage' => ['under_review'], 'attention' => ['E5']],
                'needs' => $e5Needs,
            ],
            [
                'code' => 'E6',
                'title' => 'Menunggu Review Tanpa Berkas / Keterkaitan Wajib',
                'description' => 'Usulan review tidak memiliki lampiran berkas atau belum dipetakan ke Sasaran/Indikator/IKK/Renstra.',
                'severity' => 'critical',
                'count' => $e6Count,
                'budget' => $e6Budget,
                'stage' => 'under_review',
                'query_filter' => ['stage' => ['under_review'], 'attention' => ['E6']],
                'needs' => $e6Needs,
            ],
            [
                'code' => 'E7',
                'title' => 'Ditolak dan Belum Direvisi >= 7 Hari',
                'description' => 'Usulan ditolak oleh direktur dan belum ada revisi atau tanggapan unit selama 7 hari atau lebih.',
                'severity' => 'info',
                'count' => $e7Count,
                'budget' => $e7Budget,
                'stage' => 'rejected',
                'query_filter' => ['status' => ['rejected'], 'attention' => ['E7']],
                'needs' => $e7Needs,
            ],
            [
                'code' => 'E8',
                'title' => 'Unit Kerja Belum Mengajukan Usulan',
                'description' => 'Unit kerja aktif yang belum memiliki satupun usulan terdaftar pada siklus ini.',
                'severity' => $e8Severity,
                'count' => $e8Count,
                'budget' => 0.0,
                'stage' => 'all',
                'query_filter' => [],
                'needs' => [],
            ],
            [
                'code' => 'E9',
                'title' => 'Izin Buka Kunci Berakhir Segera / Anomali Kunci',
                'description' => 'Dispensasi izin buka kunci akan kedaluwarsa dalam <= 3 hari atau usulan draf terkunci sebelum lengkap.',
                'severity' => 'warning',
                'count' => $e9Count,
                'budget' => $e9Budget,
                'stage' => 'all',
                'query_filter' => ['attention' => ['E9']],
                'needs' => $e9Needs,
            ],
        ];
    }

    /**
     * Compute stage exceptions counts for badges.
     *
     * @param  Builder<Need>  $baseQuery
     * @param  array<int, array<string, mixed>>  $exceptionItems
     * @return array{draft: int, under_review: int, rejected: int}
     */
    public function computeStageExceptionCounts(Builder $baseQuery, array $exceptionItems): array
    {
        $itemsByCode = collect($exceptionItems)->keyBy('code');

        $e1Count = (int) ($itemsByCode->get('E1')['count'] ?? 0);
        $e2Count = (int) ($itemsByCode->get('E2')['count'] ?? 0);
        $e4Count = (int) ($itemsByCode->get('E4')['count'] ?? 0);
        $e5Count = (int) ($itemsByCode->get('E5')['count'] ?? 0);
        $e6Count = (int) ($itemsByCode->get('E6')['count'] ?? 0);
        $e7Count = (int) ($itemsByCode->get('E7')['count'] ?? 0);

        $draftLowChecklist = (int) ((clone $baseQuery)
            ->where('status', 'draft')
            ->where('checklist_percentage', '>', 0)
            ->where('checklist_percentage', '<', self::MIN_CHECKLIST_PERCENTAGE)
            ->count());

        return [
            'draft' => $e1Count + $e2Count + $draftLowChecklist,
            'under_review' => $e4Count + $e5Count + $e6Count,
            'rejected' => $e7Count,
        ];
    }

    /**
     * Format a Need model for drawer display.
     *
     * @return array<string, mixed>
     */
    public function formatNeedForDrawer(Need $need, CarbonImmutable $now): array
    {
        $updatedAt = $need->updated_at ? CarbonImmutable::parse($need->updated_at) : $now;
        $idleDays = max(0, (int) $updatedAt->diffInDays($now));
        $stage = $need->getWorkflowStage();
        $unlockedUntil = $need->unlocked_until ? CarbonImmutable::parse($need->unlocked_until)->setTimezone('Asia/Makassar')->format('d M Y H:i') : null;

        return [
            'id' => (int) $need->id,
            'title' => (string) $need->title,
            'unit_name' => $need->organizationalUnit->name ?? 'Unknown',
            'organizational_unit_id' => $need->organizational_unit_id,
            'stage' => $stage,
            'total_price' => (float) $need->total_price,
            'checklist_percentage' => (float) $need->checklist_percentage,
            'idle_days' => $idleDays,
            'updated_at' => $updatedAt->setTimezone('Asia/Makassar')->format('d M Y H:i'),
            'is_priority' => (bool) $need->is_priority,
            'is_locked' => (bool) $need->is_locked,
            'lock_reason' => $need->lock_reason,
            'unlocked_until' => $unlockedUntil,
        ];
    }
}
