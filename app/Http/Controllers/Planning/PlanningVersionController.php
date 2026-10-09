<?php

declare(strict_types=1);

namespace App\Http\Controllers\Planning;

use App\Actions\Planning\ClonePlanningVersionAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Planning\StorePlanningVersionRequest;
use App\Http\Requests\Planning\UpdatePlanningVersionRequest;
use App\Models\PlanningVersion;
use App\Traits\HasDataTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class PlanningVersionController extends Controller
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
        $query = PlanningVersion::query()->withCount('activityVersions');

        if (! $request->has('sort')) {
            $query->orderBy('year_start', 'desc')->orderBy('revision_no', 'desc');
        }

        $versions = $this->applyDataTable($query, $request, self::SEARCH_COLUMNS, self::SORTABLE_COLUMNS);

        return Inertia::render('planning/versions/index', [
            'versions' => $versions,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlanningVersionRequest $request): RedirectResponse
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
    public function update(UpdatePlanningVersionRequest $request, PlanningVersion $planningVersion): RedirectResponse
    {
        $planningVersion->update($request->validated());

        return redirect()->back()->with('success', 'Planning version updated.');
    }

    /**
     * Create a new revision from an existing version.
     */
    public function createRevision(PlanningVersion $planningVersion, ClonePlanningVersionAction $action): RedirectResponse
    {
        $action->execute($planningVersion);

        return redirect()->back()->with('success', 'New planning revision created.');
    }

    /**
     * Set the specified version as the current one.
     */
    public function setCurrent(PlanningVersion $planningVersion): RedirectResponse
    {
        DB::transaction(function () use ($planningVersion): void {
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
    public function destroy(PlanningVersion $planningVersion): RedirectResponse
    {
        $planningVersion->delete();

        return redirect()->back()->with('success', 'Planning version deleted.');
    }
}
