<?php

namespace App\Http\Controllers\Planning;

use App\Http\Controllers\Controller;
use App\Http\Requests\Planning\StorePlanningVersionRequest;
use App\Http\Requests\Planning\UpdatePlanningVersionRequest;
use App\Models\PlanningVersion;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PlanningVersionController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        $this->authorizeResource(PlanningVersion::class);
    }

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['name', 'year_start', 'year_end', 'notes'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['name', 'year_start', 'year_end', 'revision_no', 'status', 'is_current'];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $versions = $this->applyDataTable(
            PlanningVersion::query(),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('planning/versions/index', [
            'versions' => $versions,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlanningVersionRequest $request)
    {
        PlanningVersion::create([
            'name' => $request->name,
            'year_start' => $request->year_start,
            'year_end' => $request->year_end,
            'revision_no' => 0,
            'status' => 'draft',
            'is_current' => false,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Planning version created.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePlanningVersionRequest $request, PlanningVersion $planningVersion)
    {
        $planningVersion->update($request->validated());

        return redirect()->back()->with('success', 'Planning version updated.');
    }

    /**
     * Create a new revision from an existing version.
     */
    public function createRevision(PlanningVersion $planningVersion)
    {
        DB::transaction(function () use ($planningVersion) {
            $newVersion = PlanningVersion::create([
                'name' => $planningVersion->name.' Revision '.($planningVersion->revision_no + 1),
                'year_start' => $planningVersion->year_start,
                'year_end' => $planningVersion->year_end,
                'revision_no' => $planningVersion->revision_no + 1,
                'status' => 'draft',
                'is_current' => false,
                'notes' => 'Revision from '.$planningVersion->name,
            ]);

            $oldActivities = $planningVersion->activityVersions()->orderBy('id')->get();
            $idMapping = [];

            foreach ($oldActivities as $oldActivity) {
                $newActivity = $oldActivity->replicate();
                $newActivity->planning_version_id = $newVersion->id;
                $newActivity->parent_id = $oldActivity->parent_id ? ($idMapping[$oldActivity->parent_id] ?? null) : null;
                $newActivity->save();

                $idMapping[$oldActivity->id] = $newActivity->id;

                // Clone activity yearly data (budget)
                foreach ($oldActivity->activityYears as $oldYear) {
                    $newYear = $oldYear->replicate();
                    $newYear->yearable_id = $newActivity->id;
                    $newYear->yearable_type = PlanningActivityVersion::class;
                    $newYear->save();
                }

                // Clone indicators
                foreach ($oldActivity->indicators as $oldIndicator) {
                    $newIndicator = $oldIndicator->replicate();
                    $newIndicator->planning_activity_version_id = $newActivity->id;
                    $newIndicator->save();

                    // Clone indicator yearly data (target)
                    foreach ($oldIndicator->activityYears as $oldIndicatorYear) {
                        $newIndicatorYear = $oldIndicatorYear->replicate();
                        $newIndicatorYear->yearable_id = $newIndicator->id;
                        $newIndicatorYear->yearable_type = PlanningActivityIndicator::class;
                        $newIndicatorYear->save();
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'New planning revision created.');
    }

    /**
     * Set the specified version as the current one.
     */
    public function setCurrent(PlanningVersion $planningVersion)
    {
        DB::transaction(function () use ($planningVersion) {
            PlanningVersion::where('year_start', $planningVersion->year_start)
                ->where('year_end', $planningVersion->year_end)
                ->where('is_current', true)
                ->update(['is_current' => false]);

            $planningVersion->update(['is_current' => true]);
        });

        return redirect()->back()->with('success', 'Current version updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PlanningVersion $planningVersion)
    {
        $planningVersion->delete();

        return redirect()->back()->with('success', 'Planning version deleted.');
    }
}
