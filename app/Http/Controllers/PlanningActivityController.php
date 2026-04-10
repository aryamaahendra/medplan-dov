<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlanningActivityRequest;
use App\Http\Requests\UpdatePlanningActivityRequest;
use App\Models\PlanningActivity;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanningActivityController extends Controller
{
    use HasDataTable;

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['code', 'name', 'full_code'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['code', 'name', 'type', 'created_at'];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $activities = $this->applyDataTable(
            PlanningActivity::query(),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('planning-activities/index', [
            'activities' => $activities,
            'filters' => $this->dataTableFilters($request),
            'parents' => PlanningActivity::query()
                ->whereIn('type', ['program', 'activity', 'sub_activity'])
                ->get(['id', 'name', 'type']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlanningActivityRequest $request)
    {
        PlanningActivity::create($request->validated());

        return redirect()->back()
            ->with('success', 'Nomenklatur Perencanaan berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePlanningActivityRequest $request, PlanningActivity $planningActivity)
    {
        $planningActivity->update($request->validated());

        return redirect()->back()
            ->with('success', 'Nomenklatur Perencanaan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PlanningActivity $planningActivity)
    {
        $planningActivity->delete();

        return redirect()->back()
            ->with('success', 'Nomenklatur Perencanaan berhasil dihapus.');
    }
}
