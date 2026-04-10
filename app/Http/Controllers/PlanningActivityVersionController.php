<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePlanningActivityYearRequest;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningVersion;
use Inertia\Inertia;
use Inertia\Response;

class PlanningActivityVersionController extends Controller
{
    /**
     * Display a listing of activities for the given version.
     */
    public function index(PlanningVersion $planningVersion): Response
    {
        $activities = $planningVersion->activityVersions()
            ->with(['activityYears', 'parent'])
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('planning-activity-versions/index', [
            'version' => $planningVersion,
            'activities' => $activities,
        ]);
    }

    /**
     * Update or create yearly target/budget for an activity version.
     */
    public function updateYearlyData(
        PlanningActivityVersion $planningActivityVersion,
        UpdatePlanningActivityYearRequest $request
    ) {
        $planningActivityVersion->activityYears()->updateOrCreate(
            ['year' => $request->year],
            [
                'target' => $request->target,
                'budget' => $request->budget,
            ]
        );

        return redirect()->back()
            ->with('success', "Target/Anggaran tahun {$request->year} berhasil diperbarui.");
    }
}
