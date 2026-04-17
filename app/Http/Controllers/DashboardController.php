<?php

namespace App\Http\Controllers;

use App\Models\Need;
use App\Models\NeedGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $needGroupId = $request->input('need_group_id');

        if (! $needGroupId) {
            $defaultGroup = NeedGroup::query()->where('is_active', true)->orderByDesc('year')->first();
            $needGroupId = $defaultGroup?->id;
        }

        $query = Need::query()->when($needGroupId, fn ($q) => $q->where('need_group_id', $needGroupId));

        $stats = [
            'total_needs' => (clone $query)->count(),
            'total_budget' => (clone $query)->sum('total_price'),
            'priority_needs' => (clone $query)->where('is_priority', true)->count(),
            'avg_completeness' => (clone $query)->avg('checklist_percentage') ?? 0,
        ];

        $statusDistribution = (clone $query)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $needsByUnit = (clone $query)
            ->with('organizationalUnit:id,name')
            ->selectRaw('organizational_unit_id, count(*) as count')
            ->groupBy('organizational_unit_id')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($item) => [
                'name' => $item->organizationalUnit->name ?? 'Unknown',
                'count' => $item->count,
            ]);

        $needsByType = (clone $query)
            ->with('needType:id,name')
            ->selectRaw('need_type_id, count(*) as count')
            ->groupBy('need_type_id')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->needType->name ?? 'Unknown',
                'count' => $item->count,
            ]);

        $recentNeeds = (clone $query)
            ->with(['organizationalUnit:id,name', 'needType:id,name'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'statusDistribution' => $statusDistribution,
            'needsByUnit' => $needsByUnit,
            'needsByType' => $needsByType,
            'recentNeeds' => $recentNeeds,
            'needGroups' => NeedGroup::query()->orderByDesc('year')->get(['id', 'name', 'year']),
            'filters' => [
                'need_group_id' => (int) $needGroupId,
            ],
        ]);
    }
}
