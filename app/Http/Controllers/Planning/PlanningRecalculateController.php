<?php

namespace App\Http\Controllers\Planning;

use App\Actions\Planning\CalculateActivityBudgetAction;
use App\Http\Controllers\Controller;
use App\Models\PlanningVersion;
use Illuminate\Http\RedirectResponse;

class PlanningRecalculateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(PlanningVersion $planningVersion): RedirectResponse
    {
        app(CalculateActivityBudgetAction::class)->recalculateVersion($planningVersion);

        return redirect()->back()->with('success', 'Penghitungan ulang anggaran telah dijadwalkan.');
    }
}
