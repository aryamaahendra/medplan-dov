<?php

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class GetFilteredNeedsAction
{
    /**
     * Execute the action to get a filtered query builder for Needs.
     *
     * @param  array<string, mixed>  $filters
     */
    public function execute(array $filters, User $user): Builder
    {
        $query = Need::query()
            ->with([
                'needGroup:id,name',
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
            ->withCount(['sasarans', 'indicators', 'kpiIndicators', 'strategicServicePlans'])
            ->when($filters['year'] ?? null, fn ($q, $v) => $q->whereIn('year', (array) $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->whereIn('status', (array) $v))
            ->when($filters['need_type_id'] ?? null, fn ($q, $v) => $q->whereIn('need_type_id', (array) $v))
            ->when($filters['organizational_unit_id'] ?? null, fn ($q, $v) => $q->whereIn('organizational_unit_id', (array) $v))
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
            ->when($filters['need_group_id'] ?? null, fn ($q, $v) => $q->where('need_group_id', $v));

        if (! $user->hasPermissionTo('view any needs')) {
            if ($user->hasPermissionTo('view descendant needs') && $user->organizational_unit_id) {
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
