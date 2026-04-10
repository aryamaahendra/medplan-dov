<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlanningActivityVersionRequest;
use App\Http\Requests\UpdatePlanningActivityVersionRequest;
use App\Http\Requests\UpdatePlanningActivityYearRequest;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningVersion;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanningActivityVersionController extends Controller
{
    use HasDataTable;

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['code', 'name', 'full_code'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['code', 'name', 'type', 'sort_order'];

    /**
     * Display a listing of activities for the given version.
     */
    public function index(PlanningVersion $planningVersion, Request $request): Response
    {
        $query = PlanningActivityVersion::query()
            ->where('planning_version_id', $planningVersion->id)
            ->with(['activityYears', 'parent']);

        if (! $request->has('sort')) {
            $query->orderBy('code', 'asc');
        }

        $activities = $this->applyDataTable(
            $query,
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
            50 // Higher default for snapshots
        );

        return Inertia::render('planning-activity-versions/index', [
            'version' => $planningVersion,
            'activities' => $activities,
            'filters' => $this->dataTableFilters($request, 50),
            'parents' => PlanningActivityVersion::query()
                ->where('planning_version_id', $planningVersion->id)
                ->whereIn('type', ['program', 'activity', 'sub_activity'])
                ->orderBy('code')
                ->get(['id', 'name', 'type']),
        ]);
    }

    /**
     * Store a newly created snapshot activity.
     */
    public function store(PlanningVersion $planningVersion, StorePlanningActivityVersionRequest $request)
    {
        $planningVersion->activityVersions()->create($request->validated());

        return redirect()->back()
            ->with('success', 'Aktivitas Snapshot berhasil ditambahkan.');
    }

    /**
     * Update the snapshot activity.
     */
    public function update(PlanningActivityVersion $planningActivityVersion, UpdatePlanningActivityVersionRequest $request)
    {
        $planningActivityVersion->update($request->validated());

        return redirect()->back()
            ->with('success', 'Aktivitas Snapshot berhasil diperbarui.');
    }

    /**
     * Remove the snapshot activity.
     */
    public function destroy(PlanningActivityVersion $planningActivityVersion)
    {
        $planningActivityVersion->delete();

        return redirect()->back()
            ->with('success', 'Aktivitas Snapshot berhasil dihapus.');
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
