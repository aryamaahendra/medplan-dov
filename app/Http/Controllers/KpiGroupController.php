<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreKpiGroupRequest;
use App\Http\Requests\UpdateKpiGroupRequest;
use App\Models\KpiGroup;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class KpiGroupController extends Controller
{
    use HasDataTable;

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['name', 'description', 'start_year', 'end_year'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['name', 'start_year', 'end_year', 'is_active', 'created_at'];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $groups = $this->applyDataTable(
            KpiGroup::query(),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('kpis/groups/index', [
            'groups' => $groups,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreKpiGroupRequest $request)
    {
        DB::transaction(function () use ($request) {
            if ($request->boolean('is_active')) {
                KpiGroup::where('is_active', true)->update(['is_active' => false]);
            }

            KpiGroup::create($request->validated());
        });

        return back()->with('success', 'KPI Group berhasil dibuat.');
    }

    public function show(KpiGroup $group): Response
    {
        return Inertia::render('kpis/groups/show', [
            'group' => $group->load('indicators.annualTargets'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateKpiGroupRequest $request, KpiGroup $group)
    {
        DB::transaction(function () use ($request, $group) {
            if ($request->boolean('is_active') && ! $group->is_active) {
                KpiGroup::where('is_active', true)->update(['is_active' => false]);
            }

            $group->update($request->validated());
        });

        return back()->with('success', 'KPI Group berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KpiGroup $group)
    {
        $group->delete();

        return back()->with('success', 'KPI Group berhasil dihapus.');
    }

    /**
     * Set the specified group as the single active group.
     */
    public function activate(KpiGroup $group)
    {
        DB::transaction(function () use ($group) {
            KpiGroup::where('is_active', true)->update(['is_active' => false]);
            $group->update(['is_active' => true]);
        });

        return back()->with('success', "KPI Group '{$group->name}' diaktifkan.");
    }
}
