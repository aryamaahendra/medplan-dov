<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\OrganizationalUnit;

final class GetNeedDashboardStatsAction
{
    /**
     * @return array{
     *     total_needs: int,
     *     total_budget: float|int,
     *     priority_needs: int,
     *     avg_completeness: float|int,
     *     approved_by_director: int,
     *     prev_group: array{id: int, name: string}|null,
     *     prev_total_needs: int|null,
     *     prev_total_budget: float|int|null,
     *     prev_priority_needs: int|null,
     *     prev_avg_completeness: float|int|null,
     *     prev_approved_by_director: int|null
     * }
     */
    public function stats(int|string|null $groupId, ?NeedGroup $currentGroup = null): array
    {
        $prevGroup = $currentGroup
            ? NeedGroup::query()
                ->where('id', '!=', $groupId)
                ->where('year', '<=', $currentGroup->year)
                ->orderByDesc('year')
                ->orderByDesc('id')
                ->first()
            : null;

        $prevGroupId = $prevGroup?->id;

        return [
            'total_needs' => Need::where('need_group_id', $groupId)->count(),
            'total_budget' => Need::where('need_group_id', $groupId)->sum('total_price'),
            'priority_needs' => Need::where('need_group_id', $groupId)->where('is_priority', true)->count(),
            'avg_completeness' => Need::where('need_group_id', $groupId)->avg('checklist_percentage') ?? 0,
            'approved_by_director' => Need::where('need_group_id', $groupId)->whereNotNull('approved_by_director_at')->count(),
            'prev_group' => $prevGroup ? ['id' => $prevGroup->id, 'name' => $prevGroup->name] : null,
            'prev_total_needs' => $prevGroupId ? Need::where('need_group_id', $prevGroupId)->count() : null,
            'prev_total_budget' => $prevGroupId ? Need::where('need_group_id', $prevGroupId)->sum('total_price') : null,
            'prev_priority_needs' => $prevGroupId ? Need::where('need_group_id', $prevGroupId)->where('is_priority', true)->count() : null,
            'prev_avg_completeness' => $prevGroupId ? (Need::where('need_group_id', $prevGroupId)->avg('checklist_percentage') ?? 0) : null,
            'prev_approved_by_director' => $prevGroupId ? Need::where('need_group_id', $prevGroupId)->whereNotNull('approved_by_director_at')->count() : null,
        ];
    }

    /**
     * @return array<string, int>
     */
    public function statusDistribution(int|string|null $groupId): array
    {
        return Need::where('need_group_id', $groupId)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status')
            ->toArray();
    }

    /**
     * @return array<int, array{
     *     unit_id: int|null,
     *     name: string,
     *     parents: array<int, string>,
     *     count: int,
     *     total_budget: float,
     *     priority_count: int,
     *     approved_count: int
     * }>
     */
    public function byUnit(int|string|null $groupId): array
    {
        $aggregates = Need::where('need_group_id', $groupId)
            ->selectRaw('organizational_unit_id, count(*) as count, sum(total_price) as total_budget, sum(case when is_priority then 1 else 0 end) as priority_count, sum(case when approved_by_director_at is not null then 1 else 0 end) as approved_count')
            ->groupBy('organizational_unit_id')
            ->orderByDesc('count')
            ->get();

        $unitIds = $aggregates->pluck('organizational_unit_id')->filter()->unique();
        $units = OrganizationalUnit::with('parentsRecursive')->whereIn('id', $unitIds)->get()->keyBy('id');

        return $aggregates->map(function ($item) use ($units) {
            $unit = $units->get($item->organizational_unit_id);
            $parents = [];
            $cursor = $unit?->parentsRecursive;
            while ($cursor) {
                array_unshift($parents, $cursor->name);
                $cursor = $cursor->parentsRecursive;
            }

            return [
                'unit_id' => $item->organizational_unit_id,
                'name' => $unit?->name ?? 'Unknown',
                'parents' => $parents,
                'count' => (int) $item->count,
                'total_budget' => (float) $item->total_budget,
                'priority_count' => (int) $item->priority_count,
                'approved_count' => (int) $item->approved_count,
            ];
        })->values()->all();
    }

    /**
     * @return array<int, array{name: string, count: int}>
     */
    public function byType(int|string|null $groupId): array
    {
        return Need::with('needType:id,name')
            ->where('need_group_id', $groupId)
            ->selectRaw('need_type_id, count(*) as count')
            ->groupBy('need_type_id')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->needType->name ?? 'Unknown',
                'count' => $item->count,
            ])
            ->all();
    }
}
