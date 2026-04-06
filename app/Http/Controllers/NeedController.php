<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNeedRequest;
use App\Http\Requests\UpdateNeedRequest;
use App\Models\KpiGroup;
use App\Models\Need;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\StrategicServicePlan;
use App\Models\Tujuan;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class NeedController extends Controller
{
    use HasDataTable;

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['title', 'description'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['title', 'year', 'status', 'total_price', 'created_at'];

    public function index(Request $request): Response
    {
        $needs = $this->applyDataTable(
            Need::query()
                ->with([
                    'organizationalUnit:id,name',
                    'needType:id,name',
                    'sasarans:id,tujuan_id,name',
                    'sasarans.tujuan:id,name',
                    'indicators:id,sasaran_id,name,baseline',
                    'indicators.sasaran:id,name',
                    'indicators.targets:id,indicator_id,year,target',
                    'kpiIndicators:id,name,unit',
                    'strategicServicePlans:id,strategic_program,service_plan',
                ])
                ->withCount(['sasarans', 'indicators', 'kpiIndicators', 'strategicServicePlans'])
                ->when($request->input('year'), fn ($q, $v) => $q->whereIn('year', (array) $v))
                ->when($request->input('status'), fn ($q, $v) => $q->whereIn('status', (array) $v))
                ->when($request->input('need_type_id'), fn ($q, $v) => $q->whereIn('need_type_id', (array) $v))
                ->when($request->input('organizational_unit_id'), fn ($q, $v) => $q->whereIn('organizational_unit_id', (array) $v))
                ->when($request->input('urgency'), fn ($q, $v) => $q->whereIn('urgency', (array) $v))
                ->when($request->input('impact'), fn ($q, $v) => $q->whereIn('impact', (array) $v))
                ->when($request->input('is_priority'), fn ($q, $v) => $q->whereIn('is_priority', (array) $v))
                ->orderBy('created_at', 'desc'),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('needs/index', [
            'needs' => $needs,
            'organizationalUnits' => OrganizationalUnit::query()->select(['id', 'name'])->get(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
            'filters' => array_merge($this->dataTableFilters($request), [
                'year' => $request->input('year'),
                'status' => $request->input('status'),
                'need_type_id' => $request->input('need_type_id'),
                'organizational_unit_id' => $request->input('organizational_unit_id'),
                'urgency' => $request->input('urgency'),
                'impact' => $request->input('impact'),
                'is_priority' => $request->input('is_priority'),
            ]),
        ]);
    }

    public function store(StoreNeedRequest $request)
    {
        DB::transaction(function () use ($request) {
            $need = Need::create($request->validated());
            $need->sasarans()->sync($request->sasaran_ids);
            $need->indicators()->sync($request->indicator_ids ?? []);
            $need->kpiIndicators()->sync($request->kpi_indicator_ids ?? []);
            $need->strategicServicePlans()->sync($request->strategic_service_plan_ids ?? []);
        });

        return redirect()->route('needs.index')
            ->with('success', 'Usulan kebutuhan berhasil dibuat.');
    }

    public function create(): Response
    {
        return Inertia::render('needs/create', [
            'organizationalUnits' => OrganizationalUnit::query()->select(['id', 'name'])->get(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
            'tujuans' => Tujuan::query()
                ->whereHas('renstra', fn ($q) => $q->where('is_active', true))
                ->select(['id', 'name'])
                ->with([
                    'sasarans' => fn ($q) => $q->select(['id', 'tujuan_id', 'name']),
                    'sasarans.indicators' => fn ($q) => $q->select(['id', 'sasaran_id', 'name']),
                ])
                ->get(),
            'kpiGroups' => KpiGroup::query()
                ->where('is_active', true)
                ->with(['indicators' => fn ($q) => $q->select(['id', 'group_id', 'parent_indicator_id', 'name', 'unit', 'is_category'])])
                ->get(),
            'strategicServicePlans' => StrategicServicePlan::query()
                ->select(['id', 'strategic_program', 'service_plan', 'year'])
                ->get(),
        ]);
    }

    public function edit(Need $need): Response
    {
        return Inertia::render('needs/edit', [
            'need' => $need->load(['sasarans:id', 'indicators:id', 'kpiIndicators:id', 'strategicServicePlans:id']),
            'organizationalUnits' => OrganizationalUnit::query()->select(['id', 'name'])->get(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
            'tujuans' => Tujuan::query()
                ->whereHas('renstra', fn ($q) => $q->where('is_active', true))
                ->select(['id', 'name'])
                ->with([
                    'sasarans' => fn ($q) => $q->select(['id', 'tujuan_id', 'name']),
                    'sasarans.indicators' => fn ($q) => $q->select(['id', 'sasaran_id', 'name']),
                ])
                ->get(),
            'kpiGroups' => KpiGroup::query()
                ->where('is_active', true)
                ->with(['indicators' => fn ($q) => $q->select(['id', 'group_id', 'parent_indicator_id', 'name', 'unit', 'is_category'])])
                ->get(),
            'strategicServicePlans' => StrategicServicePlan::query()
                ->select(['id', 'strategic_program', 'service_plan', 'year'])
                ->get(),
        ]);
    }

    public function update(UpdateNeedRequest $request, Need $need)
    {
        DB::transaction(function () use ($request, $need) {
            $need->update($request->validated());
            $need->sasarans()->sync($request->sasaran_ids);
            $need->indicators()->sync($request->indicator_ids ?? []);
            $need->kpiIndicators()->sync($request->kpi_indicator_ids ?? []);
            $need->strategicServicePlans()->sync($request->strategic_service_plan_ids ?? []);
        });

        return redirect()->route('needs.index')
            ->with('success', 'Usulan kebutuhan berhasil diperbarui.');
    }

    public function show(Need $need): Response
    {
        return Inertia::render('needs/show', [
            'need' => $need->load([
                'organizationalUnit:id,name',
                'needType:id,name',
                'sasarans:id,tujuan_id,name',
                'sasarans.tujuan:id,name',
                'indicators:id,sasaran_id,name,baseline',
                'indicators.sasaran:id,name',
                'indicators.targets:id,indicator_id,year,target',
                'kpiIndicators:id,name,unit,is_category,parent_indicator_id',
                'strategicServicePlans:id,strategic_program,service_plan,year',
            ]),
        ]);
    }

    public function destroy(Need $need)
    {
        $need->delete();

        return redirect()->route('needs.index')
            ->with('success', 'Usulan kebutuhan berhasil dihapus.');
    }
}
