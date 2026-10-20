<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Exceptions\Need\NeedExceptionCatalog;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class GetFilteredNeedsAction
{
    public function __construct(
        protected NeedExceptionCatalog $exceptionCatalog
    ) {}

    /**
     * Execute the action to get a filtered query builder for Needs.
     *
     * @param  array<string, mixed>  $filters
     */
    public function handle(array $filters, User $user): Builder
    {
        return $this->execute($filters, $user);
    }

    public function execute(array $filters, User $user): Builder
    {
        $query = Need::query()
            ->with([
                'needGroup:id,name,is_active,submission_start_at,submission_end_at',
                'organizationalUnit:id,name,parent_id',
                'organizationalUnit.parentsRecursive',
                'needType:id,name',
                'sasarans:id,tujuan_id,name',
                'sasarans.tujuan:id,name',
                'indicators:id,sasaran_id,name,baseline',
                'indicators.sasaran:id,name',
                'indicators.targets:id,indicator_id,year,target',
                'kpiIndicators:id,name,unit',
                'strategicServicePlans:id,strategic_program,service_plan',
            ])
            ->withCount(['sasarans', 'indicators', 'kpiIndicators', 'strategicServicePlans', 'attachments'])
            ->when($filters['year'] ?? null, fn ($q, $v) => $q->whereIn('year', (array) $v))
            ->when($filters['stage'] ?? null, function ($q, $v) {
                $stages = array_filter((array) $v);
                if (empty($stages)) {
                    return;
                }
                $q->where(function ($sub) use ($stages) {
                    foreach ($stages as $stage) {
                        if ($stage === 'approved') {
                            $sub->orWhere('status', Need::STATUS_APPROVED)
                                ->orWhereNotNull('approved_by_director_at');
                        } elseif ($stage === 'under_review' || $stage === Need::STATUS_SUBMITTED) {
                            $sub->orWhere('status', Need::STATUS_SUBMITTED)
                                ->orWhere(function ($under) {
                                    $under->where('status', 'approved')->whereNull('approved_by_director_at');
                                });
                        } elseif ($stage === Need::STATUS_REJECTED) {
                            $sub->orWhere('status', Need::STATUS_REJECTED);
                        } elseif ($stage === Need::STATUS_REVISION) {
                            $sub->orWhere('status', Need::STATUS_REVISION);
                        } elseif ($stage === Need::STATUS_DRAFT) {
                            $sub->orWhere('status', Need::STATUS_DRAFT);
                        } elseif ($stage === 'locked') {
                            $sub->orWhere('is_locked', true);
                        }
                    }
                });
            })
            ->when($filters['status'] ?? null, function ($q, $v) {
                $statuses = array_filter((array) $v);
                if (! empty($statuses)) {
                    $q->whereIn('status', $statuses);
                }
            })
            ->when(isset($filters['is_recommended_for_next_cycle']) && $filters['is_recommended_for_next_cycle'] !== '', function ($q) use ($filters) {
                $raw = (array) $filters['is_recommended_for_next_cycle'];
                $hasTrue = in_array(true, $raw, true) || in_array('1', $raw, true) || in_array(1, $raw, true) || in_array('true', $raw, true);
                $hasFalse = in_array(false, $raw, true) || in_array('0', $raw, true) || in_array(0, $raw, true) || in_array('false', $raw, true);

                if ($hasTrue && ! $hasFalse) {
                    $q->where('is_recommended_for_next_cycle', true);
                } elseif ($hasFalse && ! $hasTrue) {
                    $q->where('is_recommended_for_next_cycle', false);
                }
            })
            ->when($filters['need_type_id'] ?? null, fn ($q, $v) => $q->whereIn('need_type_id', (array) $v))
            ->when($filters['organizational_unit_id'] ?? null, function ($q, $v) use ($filters) {
                $rawValues = (array) $v;
                if (in_array('trashed', $rawValues, true)) {
                    $otherIds = array_filter($rawValues, fn ($id) => $id !== 'trashed');
                    if (empty($otherIds)) {
                        $q->whereIn('organizational_unit_id', OrganizationalUnit::onlyTrashed()->select('id'));

                        return;
                    }

                    $q->where(function ($sub) use ($otherIds, $filters) {
                        $sub->whereIn('organizational_unit_id', OrganizationalUnit::onlyTrashed()->select('id'));
                        if (! empty($filters['include_descendants'])) {
                            $allUnitIds = [];
                            foreach ($otherIds as $uId) {
                                $unit = OrganizationalUnit::query()->find($uId);
                                if ($unit) {
                                    $unit->loadMissing('descendantsRecursive');
                                    $allUnitIds = array_merge($allUnitIds, $this->extractUnitIds($unit));
                                } else {
                                    $allUnitIds[] = (int) $uId;
                                }
                            }
                            $sub->orWhereIn('organizational_unit_id', array_unique($allUnitIds));
                        } else {
                            $sub->orWhereIn('organizational_unit_id', $otherIds);
                        }
                    });

                    return;
                }

                $unitIds = array_filter($rawValues);
                if (empty($unitIds)) {
                    return;
                }
                if (! empty($filters['include_descendants'])) {
                    $allUnitIds = [];
                    foreach ($unitIds as $uId) {
                        $unit = OrganizationalUnit::query()->find($uId);
                        if ($unit) {
                            $unit->loadMissing('descendantsRecursive');
                            $allUnitIds = array_merge($allUnitIds, $this->extractUnitIds($unit));
                        } else {
                            $allUnitIds[] = (int) $uId;
                        }
                    }
                    $q->whereIn('organizational_unit_id', array_unique($allUnitIds));
                } else {
                    $q->whereIn('organizational_unit_id', $unitIds);
                }
            })
            ->when($filters['urgency'] ?? null, fn ($q, $v) => $q->whereIn('urgency', (array) $v))
            ->when($filters['impact'] ?? null, fn ($q, $v) => $q->whereIn('impact', (array) $v))
            ->when($filters['is_priority'] ?? null, fn ($q, $v) => $q->whereIn('is_priority', (array) $v))
            ->when($filters['is_approved_by_director'] ?? null, function ($q, $v) {
                $v = (array) $v;
                if (in_array('1', $v) && ! in_array('0', $v)) {
                    $q->whereNotNull('approved_by_director_at');
                } elseif (in_array('0', $v) && ! in_array('1', $v)) {
                    $q->whereNull('approved_by_director_at');
                }
            })
            ->when($filters['min_checklist_score'] ?? null, function ($q, $v) {
                $v = (array) $v;
                if (in_array('85', $v)) {
                    $q->where('checklist_percentage', '>=', 85);
                }
            })
            ->when($filters['need_group_id'] ?? null, fn ($q, $v) => $q->where('need_group_id', $v))
            ->when($filters['attention'] ?? null, function ($q, $v) {
                $keys = array_filter((array) $v);
                if (! empty($keys)) {
                    $this->exceptionCatalog->applyAttentionScope($q, $keys);
                }
            });

        if (! $user->can('view any needs')) {
            if ($user->can('view descendant needs') && $user->organizational_unit_id) {
                $unit = $user->organizationalUnit;
                if ($unit) {
                    $unit->load('descendantsRecursive');
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
     * Compute aggregate counts for stage tabs and attention chips across all matching needs.
     *
     * @param  array<string, mixed>  $filters
     * @return array{
     *     stageCounts: array{all: int, draft: int, under_review: int, approved: int, rejected: int, locked: int},
     *     attentionCounts: array{low_checklist: int, revision_closing: int, submission_closing: int, has_notes: int, priority_only: int}
     * }
     */
    public function getIndexCounts(
        array $filters,
        User $user,
        ?NeedGroup $currentGroup = null,
        ?string $search = null,
    ): array {
        $baseFilters = $filters;
        unset($baseFilters['stage'], $baseFilters['attention']);

        $query = $this->execute($baseFilters, $user);

        if ($search !== null && $search !== '') {
            $query->where(function (Builder $q) use ($search): void {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $now = CarbonImmutable::now('Asia/Makassar');
        $nowStr = $now->toDateTimeString();
        $threeDaysAheadStr = $now->addDays(NeedExceptionCatalog::REVISION_CLOSING_DAYS)->toDateTimeString();
        $minChecklist = NeedExceptionCatalog::MIN_CHECKLIST_PERCENTAGE;

        $isSubmissionClosing = $currentGroup?->submission_end_at !== null
            && $now->lte($currentGroup->submission_end_at)
            && $now->addDays(NeedExceptionCatalog::SUBMISSION_CLOSING_DAYS)->gte($currentGroup->submission_end_at);

        /** @var object{all_count?: int|string, draft_count?: int|string, under_review_count?: int|string, approved_count?: int|string, rejected_count?: int|string, locked_count?: int|string, low_checklist_count?: int|string, revision_closing_count?: int|string, has_notes_count?: int|string, priority_count?: int|string}|null $aggregates */
        $aggregates = (clone $query)
            ->toBase()
            ->cloneWithout(['columns', 'orders'])
            ->selectRaw("
                COUNT(*) as all_count,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
                COUNT(CASE WHEN status = 'submitted' OR (status = 'approved' AND approved_by_director_at IS NULL) THEN 1 END) as under_review_count,
                COUNT(CASE WHEN status = 'approved' OR approved_by_director_at IS NOT NULL THEN 1 END) as approved_count,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
                COUNT(CASE WHEN is_locked = true THEN 1 END) as locked_count,
                COUNT(CASE WHEN checklist_percentage > 0 AND checklist_percentage < {$minChecklist} AND approved_by_director_at IS NULL THEN 1 END) as low_checklist_count,
                COUNT(CASE WHEN (unlocked_until IS NOT NULL AND unlocked_until >= '{$nowStr}' AND unlocked_until <= '{$threeDaysAheadStr}') OR (is_locked = true AND status = 'draft' AND checklist_percentage < {$minChecklist}) THEN 1 END) as revision_closing_count,
                COUNT(CASE WHEN notes IS NOT NULL AND notes != '' THEN 1 END) as has_notes_count,
                COUNT(CASE WHEN is_priority = true THEN 1 END) as priority_count
            ")
            ->first();

        return [
            'stageCounts' => [
                'all' => (int) ($aggregates->all_count ?? 0),
                'draft' => (int) ($aggregates->draft_count ?? 0),
                'under_review' => (int) ($aggregates->under_review_count ?? 0),
                'approved' => (int) ($aggregates->approved_count ?? 0),
                'rejected' => (int) ($aggregates->rejected_count ?? 0),
                'locked' => (int) ($aggregates->locked_count ?? 0),
            ],
            'attentionCounts' => [
                'low_checklist' => (int) ($aggregates->low_checklist_count ?? 0),
                'revision_closing' => (int) ($aggregates->revision_closing_count ?? 0),
                'submission_closing' => $isSubmissionClosing ? (int) ($aggregates->draft_count ?? 0) : 0,
                'has_notes' => (int) ($aggregates->has_notes_count ?? 0),
                'priority_only' => (int) ($aggregates->priority_count ?? 0),
            ],
        ];
    }
}
