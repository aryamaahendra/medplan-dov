<?php

declare(strict_types=1);

namespace App\Http\Controllers\Planning;

use App\Actions\Planning\CalculateActivityBudgetAction;
use App\Http\Controllers\Controller;
use App\Models\PlanningVersion;
use Illuminate\Http\RedirectResponse;

final class PlanningRecalculateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(PlanningVersion $planningVersion, CalculateActivityBudgetAction $action): RedirectResponse
    {
        $this->authorize('update', $planningVersion);

        $action->recalculateVersion($planningVersion);

        return redirect()->back()->with('success', 'Penghitungan ulang anggaran telah dijadwalkan.');
    }
}
