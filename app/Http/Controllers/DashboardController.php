<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Need;
use App\Models\NeedGroup;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'dashboardData' => Inertia::defer(function () {
                $groups = NeedGroup::orderByDesc('year')->orderByDesc('id')->get();

                if ($groups->isEmpty()) {
                    return [];
                }

                $groupIds = $groups->pluck('id')->all();

                // Query 1: overall counts and totals grouped by need_group_id
                $aggregates = Need::query()
                    ->whereIn('need_group_id', $groupIds)
                    ->select([
                        'need_group_id',
                        DB::raw('COUNT(*) as total_needs'),
                        DB::raw('COALESCE(SUM(total_price), 0) as total_budget'),
                        DB::raw('COALESCE(AVG(checklist_percentage), 0) as avg_completeness'),
                    ])
                    ->groupBy('need_group_id')
                    ->get()
                    ->keyBy('need_group_id');

                // Query 2: conditional counts (priority & approved_by_director) grouped by need_group_id
                $conditionalCounts = Need::query()
                    ->whereIn('need_group_id', $groupIds)
                    ->select([
                        'need_group_id',
                        DB::raw('SUM(CASE WHEN is_priority THEN 1 ELSE 0 END) as priority_needs'),
                        DB::raw('SUM(CASE WHEN approved_by_director_at IS NOT NULL THEN 1 ELSE 0 END) as approved_by_director'),
                    ])
                    ->groupBy('need_group_id')
                    ->get()
                    ->keyBy('need_group_id');

                return $groups->map(function ($group) use ($aggregates, $conditionalCounts) {
                    $groupId = $group->id;
                    $agg = $aggregates->get($groupId);
                    $cond = $conditionalCounts->get($groupId);

                    return [
                        'id' => $groupId,
                        'name' => $group->name,
                        'year' => $group->year,
                        'total_needs' => (int) ($agg?->total_needs ?? 0),
                        'total_budget' => (float) ($agg?->total_budget ?? 0),
                        'priority_needs' => (int) ($cond?->priority_needs ?? 0),
                        'approved_by_director' => (int) ($cond?->approved_by_director ?? 0),
                        'avg_completeness' => (float) ($agg?->avg_completeness ?? 0),
                    ];
                })->all();
            }),
        ]);
    }
}
