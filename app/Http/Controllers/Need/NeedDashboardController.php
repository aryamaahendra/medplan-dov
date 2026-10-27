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

final class NeedDashboardController extends Controller
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
     * Unified Dashboard page.
     */
    public function index(Request $request, GetNeedDashboardStatsAction $statsAction): Response
    {
        $this->authorize('viewAny', Need::class);

        $groupId = $this->resolveGroupId($request);
        if (! $groupId) {
            return Inertia::render('dashboard/index', [
                'dashboardPayload' => null,
            ]);
        }

        $user = $request->user();

        return Inertia::render('dashboard/index', [
            'dashboardPayload' => Inertia::defer(fn () => $statsAction->getDashboardPayload($groupId, $user), 'dashboardPayload'),
        ]);
    }

    /**
     * Redirect legacy dashboard variants to unified dashboard.
     */
    public function redirectOld(Request $request): RedirectResponse
    {
        return redirect()->route('dashboard', $request->query());
    }

    public function executive(Request $request): RedirectResponse
    {
        return $this->redirectOld($request);
    }

    public function operations(Request $request): RedirectResponse
    {
        return $this->redirectOld($request);
    }

    public function workspace(Request $request): RedirectResponse
    {
        return $this->redirectOld($request);
    }
}
