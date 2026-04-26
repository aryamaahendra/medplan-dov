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
            'dashboardData' => Inertia::defer(function () {
                $groups = NeedGroup::orderByDesc('year')->orderByDesc('id')->get();

                return $groups->map(function ($group) {
                    $groupId = $group->id;
                    $needsQuery = Need::where('need_group_id', $groupId);

                    return [
                        'id' => $groupId,
                        'name' => $group->name,
                        'year' => $group->year,
                        'total_needs' => (int) (clone $needsQuery)->count(),
                        'total_budget' => (float) (clone $needsQuery)->sum('total_price'),
                        'priority_needs' => (int) (clone $needsQuery)->where('is_priority', true)->count(),
                        'approved_by_director' => (int) (clone $needsQuery)->whereNotNull('approved_by_director_at')->count(),
                        'avg_completeness' => (float) ((clone $needsQuery)->avg('checklist_percentage') ?? 0),
                    ];
                })->all();
            }),
        ]);
    }
}
