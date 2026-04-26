<?php

namespace App\Http\Controllers;

use App\Models\Need;
use App\Models\NeedGroup;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'groups' => NeedGroup::orderByDesc('year')->orderByDesc('id')->get(['id', 'name', 'year']),
            'dashboardData' => Inertia::defer(function () {
                $groups = NeedGroup::orderByDesc('year')->orderByDesc('id')->get();
                $stats = [];
                foreach ($groups as $group) {
                    $groupId = $group->id;
                    $needsQuery = Need::where('need_group_id', $groupId);

                    $totalNeeds = (clone $needsQuery)->count();

                    $stats[] = [
                        'id' => $groupId,
                        'name' => $group->name,
                        'year' => $group->year,
                        'total_needs' => $totalNeeds,
                        'total_budget' => (float) (clone $needsQuery)->sum('total_price'),
                        'priority_needs' => (int) (clone $needsQuery)->where('is_priority', true)->count(),
                        'approved_by_director' => (int) (clone $needsQuery)->whereNotNull('approved_by_director_at')->count(),
                        'avg_completeness' => (float) ((clone $needsQuery)->avg('checklist_percentage') ?? 0),
                        'status_distribution' => (clone $needsQuery)
                            ->selectRaw('status, count(*) as count')
                            ->groupBy('status')
                            ->get()
                            ->pluck('count', 'status')
                            ->toArray(),
                        'needs_by_type' => (clone $needsQuery)
                            ->with('needType:id,name')
                            ->selectRaw('need_type_id, count(*) as count')
                            ->groupBy('need_type_id')
                            ->orderByDesc('count')
                            ->get()
                            ->map(fn ($item) => [
                                'name' => $item->needType->name ?? 'Unknown',
                                'count' => $item->count,
                            ])
                            ->all(),
                        'needs_by_unit' => (clone $needsQuery)
                            ->with([
                                'organizationalUnit:id,name,parent_id',
                                'organizationalUnit.parentsRecursive',
                            ])
                            ->selectRaw('organizational_unit_id, count(*) as count, sum(total_price) as total_budget, sum(case when is_priority then 1 else 0 end) as priority_count, sum(case when approved_by_director_at is not null then 1 else 0 end) as approved_count')
                            ->groupBy('organizational_unit_id')
                            ->orderByDesc('count')
                            ->get()
                            ->map(function ($item) {
                                $unit = $item->organizationalUnit;
                                $parents = [];
                                $cursor = $unit?->parent;
                                while ($cursor) {
                                    array_unshift($parents, $cursor->name);
                                    $cursor = $cursor->parentsRecursive;
                                }

                                return [
                                    'unit_id' => $unit?->id,
                                    'name' => $unit?->name ?? 'Unknown',
                                    'parents' => $parents,
                                    'count' => (int) $item->count,
                                    'total_budget' => (float) $item->total_budget,
                                    'priority_count' => (int) $item->priority_count,
                                    'approved_count' => (int) $item->approved_count,
                                ];
                            })
                            ->values()
                            ->all(),
                    ];
                }

                return $stats;
            }, 'dashboard_data'),
        ]);
    }
}
