<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlanningVersionRequest;
use App\Models\PlanningActivity;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningVersion;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PlanningVersionController extends Controller
{
    use HasDataTable;

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['name', 'fiscal_year', 'notes'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['name', 'fiscal_year', 'revision_no', 'status', 'is_current'];

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

        return Inertia::render('planning-versions/index', [
            'versions' => $versions,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlanningVersionRequest $request)
    {
        DB::transaction(function () use ($request) {
            $version = PlanningVersion::create([
                'name' => $request->name,
                'fiscal_year' => $request->fiscal_year,
                'revision_no' => 0,
                'status' => 'draft',
                'is_current' => false,
                'notes' => $request->notes,
            ]);

            // Initial population from source activities
            $sourceActivities = PlanningActivity::orderBy('id')->get();
            $idMapping = [];

            foreach ($sourceActivities as $source) {
                $newActivity = PlanningActivityVersion::create([
                    'planning_version_id' => $version->id,
                    'source_activity_id' => $source->id,
                    'parent_id' => $source->parent_id ? ($idMapping[$source->parent_id] ?? null) : null,
                    'code' => $source->code,
                    'name' => $source->name,
                    'type' => $source->type,
                    'full_code' => $source->full_code,
                    'sort_order' => $source->id,
                ]);
                $idMapping[$source->id] = $newActivity->id;
            }
        });

        return redirect()->back()->with('success', 'Planning version created from source activities.');
    }

    /**
     * Create a new revision from an existing version.
     */
    public function createRevision(PlanningVersion $planningVersion)
    {
        DB::transaction(function () use ($planningVersion) {
            $newVersion = PlanningVersion::create([
                'name' => $planningVersion->name.' Revision '.($planningVersion->revision_no + 1),
                'fiscal_year' => $planningVersion->fiscal_year,
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

                // Clone yearly data
                foreach ($oldActivity->activityYears as $oldYear) {
                    $newYear = $oldYear->replicate();
                    $newYear->planning_activity_version_id = $newActivity->id;
                    $newYear->save();
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
            PlanningVersion::where('fiscal_year', $planningVersion->fiscal_year)
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
