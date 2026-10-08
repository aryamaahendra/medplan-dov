<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\OrganizationalUnit;
use App\Models\User;
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
                            $sub->orWhereNotNull('approved_by_director_at');
                        } elseif ($stage === 'under_review') {
                            $sub->orWhere(function ($under) {
                                $under->where('status', 'approved')->whereNull('approved_by_director_at');
                            });
                        } elseif ($stage === 'rejected') {
                            $sub->orWhere('status', 'rejected');
                        } elseif ($stage === 'draft') {
                            $sub->orWhere(function ($draft) {
                                $draft->where('status', 'draft')->whereNull('approved_by_director_at');
                            });
                        }
                    }
                });
            })
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->whereIn('status', (array) $v))
            ->when($filters['need_type_id'] ?? null, fn ($q, $v) => $q->whereIn('need_type_id', (array) $v))
            ->when($filters['organizational_unit_id'] ?? null, function ($q, $v) use ($filters) {
                $unitIds = array_filter((array) $v);
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
}
