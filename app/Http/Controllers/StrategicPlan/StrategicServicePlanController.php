<?php

namespace App\Http\Controllers\StrategicPlan;

use App\Http\Controllers\Controller;
use App\Http\Requests\StrategicPlan\StoreStrategicServicePlanRequest;
use App\Http\Requests\StrategicPlan\UpdateStrategicServicePlanRequest;
use App\Models\StrategicServicePlan;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StrategicServicePlanController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        $this->authorizeResource(StrategicServicePlan::class);
    }

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['strategic_program', 'service_plan', 'target', 'policy_direction'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['year', 'strategic_program', 'created_at'];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $plans = $this->applyDataTable(
            StrategicServicePlan::query(),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('strategic-plan/service-plans/index', [
            'plans' => $plans,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStrategicServicePlanRequest $request)
    {
        StrategicServicePlan::create($request->validated());

        return redirect()->back()
            ->with('success', 'Rencana Pengembangan Layanan Strategis berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStrategicServicePlanRequest $request, StrategicServicePlan $strategicServicePlan)
    {
        $strategicServicePlan->update($request->validated());

        return redirect()->back()
            ->with('success', 'Rencana Pengembangan Layanan Strategis berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StrategicServicePlan $strategicServicePlan)
    {
        $strategicServicePlan->delete();

        return redirect()->back()
            ->with('success', 'Rencana Pengembangan Layanan Strategis berhasil dihapus.');
    }
}
