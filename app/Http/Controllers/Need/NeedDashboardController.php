<?php

declare(strict_types=1);

namespace App\Http\Controllers\Need;

use App\Actions\Need\GetNeedDashboardStatsAction;
use App\Http\Controllers\Controller;
use App\Models\Need;
use App\Models\NeedGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NeedDashboardController extends Controller
{
    /**
     * Resolve need_group_id, fallback to active or latest group.
     */
    private function resolveGroupId(Request $request): ?int
    {
        $groupId = $request->input('need_group_id');

        if ($groupId) {
            return (int) $groupId;
        }

        $group = NeedGroup::query()->where('is_active', true)->orderByDesc('year')->first()
            ?? NeedGroup::query()->orderByDesc('year')->orderByDesc('id')->first();

        return $group?->id;
    }

    /**
     * Executive Dashboard page.
     */
    public function executive(Request $request, GetNeedDashboardStatsAction $statsAction): Response|RedirectResponse
    {
        $this->authorize('viewAny', Need::class);

        $groupId = $this->resolveGroupId($request);
        if (! $groupId) {
            return Inertia::render('dashboard/executive', [
                'dashboardPayload' => null,
            ]);
        }

        $compareGroupId = $request->integer('compare_group_id') ?: null;
        $user = $request->user();

        return Inertia::render('dashboard/executive', [
            'dashboardPayload' => Inertia::defer(fn () => $statsAction->getDashboardPayload($groupId, $user, $compareGroupId), 'dashboardPayload'),
        ]);
    }

    /**
     * Operations Dashboard page.
     */
    public function operations(Request $request, GetNeedDashboardStatsAction $statsAction): Response|RedirectResponse
    {
        $this->authorize('viewAny', Need::class);

        $groupId = $this->resolveGroupId($request);
        if (! $groupId) {
            return Inertia::render('dashboard/operations', [
                'dashboardPayload' => null,
            ]);
        }

        $compareGroupId = $request->integer('compare_group_id') ?: null;
        $user = $request->user();

        return Inertia::render('dashboard/operations', [
            'dashboardPayload' => Inertia::defer(fn () => $statsAction->getDashboardPayload($groupId, $user, $compareGroupId), 'dashboardPayload'),
        ]);
    }

    /**
     * Analytical Workspace Dashboard page.
     */
    public function workspace(Request $request, GetNeedDashboardStatsAction $statsAction): Response|RedirectResponse
    {
        $this->authorize('viewAny', Need::class);

        $groupId = $this->resolveGroupId($request);
        if (! $groupId) {
            return Inertia::render('dashboard/workspace', [
                'dashboardPayload' => null,
            ]);
        }

        $compareGroupId = $request->integer('compare_group_id') ?: null;
        $user = $request->user();

        return Inertia::render('dashboard/workspace', [
            'dashboardPayload' => Inertia::defer(fn () => $statsAction->getDashboardPayload($groupId, $user, $compareGroupId), 'dashboardPayload'),
        ]);
    }
}
