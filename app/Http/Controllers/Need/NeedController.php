<?php

namespace App\Http\Controllers\Need;

use App\Actions\Need\GetFilteredNeedsAction;
use App\Actions\Need\StoreNeedAction;
use App\Actions\Need\UpdateNeedAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Need\StoreNeedRequest;
use App\Http\Requests\Need\UpdateNeedRequest;
use App\Http\Resources\ChecklistQuestionResource;
use App\Http\Resources\NeedChecklistAnswerResource;
use App\Http\Resources\NeedResource;
use App\Models\KpiGroup;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\PlanningActivityVersion;
use App\Models\StrategicServicePlan;
use App\Models\Tujuan;
use App\Models\User;
use App\Traits\HasDataTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NeedController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        //
    }

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['title', 'description'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['title', 'year', 'status', 'total_price', 'created_at'];

    public function index(Request $request, GetFilteredNeedsAction $action): Response|RedirectResponse
    {
        $this->authorize('viewAny', Need::class);
        $groupId = $request->input('need_group_id');

        if (! $groupId) {
            $firstGroup = NeedGroup::query()->where('is_active', true)->orderByDesc('year')->first();
            if ($firstGroup) {
                return redirect()->route('needs.index', ['need_group_id' => $firstGroup->id]);
            }
        }

        $currentGroup = $groupId ? NeedGroup::find($groupId) : null;

        $filters = [
            'year' => $request->input('year'),
            'status' => $request->input('status'),
            'need_type_id' => $request->input('need_type_id'),
            'organizational_unit_id' => $request->input('organizational_unit_id'),
            'urgency' => $request->input('urgency'),
            'impact' => $request->input('impact'),
            'is_priority' => $request->input('is_priority'),
            'is_approved_by_director' => $request->input('is_approved_by_director'),
            'min_checklist_score' => $request->input('min_checklist_score'),
            'need_group_id' => $groupId,
        ];

        $query = $action->execute($filters, $request->user());

        $needs = $this->applyDataTable(
            $query->orderBy('created_at', 'desc'),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        $needs->getCollection()->transform(fn ($need) => NeedResource::make($need)->resolve());

        return Inertia::render('need/needs/index', [
            'needs' => $needs,
            'currentGroup' => $currentGroup,
            'organizationalUnits' => OrganizationalUnit::query()->select(['id', 'name', 'parent_id'])->get(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
            'filters' => array_merge($this->dataTableFilters($request), $filters),
        ]);
    }

    public function store(StoreNeedRequest $request, StoreNeedAction $action): RedirectResponse
    {
        $this->authorize('create', Need::class);
        $need = $action->execute(
            $request->validated(),
            $request->file('attachments'),
            $request->input('attachment_names', []),
            $request->file('technical_specification_attachments'),
            $request->input('technical_specification_attachment_names', [])
        );

        return redirect()->route('needs.index', ['need_group_id' => $need->need_group_id])
            ->with('success', 'Usulan kebutuhan berhasil dibuat.');
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $this->authorize('create', Need::class);
        $groupId = $request->input('need_group_id');
        $currentGroup = $groupId ? NeedGroup::findOrFail($groupId) : null;

        return Inertia::render('need/needs/create', [
            'currentGroup' => $currentGroup,
            'organizationalUnits' => OrganizationalUnit::query()->select(['id', 'name', 'parent_id'])->get(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
            'tujuans' => Tujuan::query()
                ->whereHas('renstra', fn ($q) => $q->where('is_active', true))
                ->select(['id', 'renstra_id', 'name'])
                ->with([
                    'renstra:id,year_start,year_end',
                    'sasarans' => fn ($q) => $q->select(['id', 'tujuan_id', 'name']),
                    'sasarans.indicators' => fn ($q) => $q->select(['id', 'sasaran_id', 'name']),
                    'sasarans.indicators.targets' => fn ($q) => $q->select(['id', 'indicator_id', 'year', 'target']),
                ])
                ->get(),
            'kpiGroups' => KpiGroup::query()
                ->where('is_active', true)
                ->with([
                    'indicators' => fn ($q) => $q->select(['id', 'group_id', 'parent_indicator_id', 'name', 'unit', 'is_category']),
                    'indicators.annualTargets' => fn ($q) => $q->select(['id', 'indicator_id', 'year', 'target_value']),
                ])
                ->get(),
            'strategicServicePlans' => StrategicServicePlan::query()
                ->select(['id', 'strategic_program', 'service_plan', 'year'])
                ->get(),
            'planningActivities' => PlanningActivityVersion::query()
                ->whereHas('planningVersion', fn ($q) => $q->where('is_current', true))
                ->whereNull('parent_id')
                ->with([
                    'planningVersion:id,year_start,year_end',
                    'activityYears',
                    'indicators.activityYears',
                    'children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                    'children.children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                    'children.children.children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                    'children.children.children.children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                ])
                ->get(),
        ]);
    }

    public function edit(Need $need): Response
    {
        $this->authorize('update', $need);

        return Inertia::render('need/needs/edit', [
            'need' => NeedResource::make($need->load([
                'sasarans:id',
                'indicators:id',
                'kpiIndicators:id',
                'strategicServicePlans:id',
                'planningActivityVersions:id',
                'planningActivityIndicators:id',
                'detail',
                'attachments',
            ]))->resolve(),
            'currentGroup' => $need->needGroup,
            'organizationalUnits' => OrganizationalUnit::query()->select(['id', 'name', 'parent_id'])->get(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
            'tujuans' => Tujuan::query()
                ->whereHas('renstra', fn ($q) => $q->where('is_active', true))
                ->select(['id', 'renstra_id', 'name'])
                ->with([
                    'renstra:id,year_start,year_end',
                    'sasarans' => fn ($q) => $q->select(['id', 'tujuan_id', 'name']),
                    'sasarans.indicators' => fn ($q) => $q->select(['id', 'sasaran_id', 'name']),
                    'sasarans.indicators.targets' => fn ($q) => $q->select(['id', 'indicator_id', 'year', 'target']),
                ])
                ->get(),
            'kpiGroups' => KpiGroup::query()
                ->where('is_active', true)
                ->with([
                    'indicators' => fn ($q) => $q->select(['id', 'group_id', 'parent_indicator_id', 'name', 'unit', 'is_category']),
                    'indicators.annualTargets' => fn ($q) => $q->select(['id', 'indicator_id', 'year', 'target_value']),
                ])
                ->get(),
            'strategicServicePlans' => StrategicServicePlan::query()
                ->select(['id', 'strategic_program', 'service_plan', 'year'])
                ->get(),
            'planningActivities' => PlanningActivityVersion::query()
                ->whereHas('planningVersion', fn ($q) => $q->where('is_current', true))
                ->whereNull('parent_id')
                ->with([
                    'planningVersion:id,year_start,year_end',
                    'activityYears',
                    'indicators.activityYears',
                    'children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                    'children.children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                    'children.children.children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                    'children.children.children.children' => fn ($q) => $q->with(['activityYears', 'indicators.activityYears']),
                ])
                ->get(),
        ]);
    }

    public function update(UpdateNeedRequest $request, Need $need, UpdateNeedAction $action): RedirectResponse
    {
        $this->authorize('update', $need);
        $action->execute(
            $need,
            $request->validated(),
            $request->file('attachments'),
            $request->input('attachment_names', []),
            $request->file('technical_specification_attachments'),
            $request->input('technical_specification_attachment_names', [])
        );

        return redirect()->route('needs.index', ['need_group_id' => $need->need_group_id])
            ->with('success', 'Usulan kebutuhan berhasil diperbarui.');
    }

    public function show(Need $need): Response
    {
        $this->authorize('view', $need);

        return Inertia::render('need/needs/show', [
            'need' => NeedResource::make($need->load([
                'organizationalUnit:id,name,parent_id',
                'organizationalUnit.parentsRecursive',
                'needType:id,name',
                'sasarans:id,tujuan_id,name',
                'sasarans.tujuan:id,name',
                'indicators:id,sasaran_id,name,baseline',
                'indicators.sasaran:id,name',
                'indicators.targets:id,indicator_id,year,target',
                'kpiIndicators:id,name,unit,is_category,parent_indicator_id,group_id',
                'kpiIndicators.group:id,name,start_year,end_year',
                'kpiIndicators.parentIndicator:id,name,is_category',
                'kpiIndicators.annualTargets:id,indicator_id,year,target_value',
                'strategicServicePlans:id,strategic_program,service_plan,year,target,policy_direction',
                'planningActivityVersions:id,name,type,code,full_code',
                'planningActivityIndicators:id,name,baseline,unit',
                'detail',
                'attachments',
            ]))->resolve(),
            'checklistQuestions' => ChecklistQuestionResource::collection(
                $need->needGroup->checklistQuestions()
                    ->wherePivot('is_active', true)
                    ->orderByPivot('order_column')
                    ->get()
            ),
            'existingAnswers' => NeedChecklistAnswerResource::collection(
                $need->checklistAnswers
            ),
            'users' => User::query()->select(['id', 'name', 'nip'])->orderBy('name')->get(),
        ]);
    }

    public function destroy(Need $need): RedirectResponse
    {
        $this->authorize('delete', $need);
        $groupId = $need->need_group_id;
        $need->delete();

        return redirect()->route('needs.index', ['need_group_id' => $groupId])
            ->with('success', 'Usulan kebutuhan berhasil dihapus.');
    }

    public function updateDirectorReview(Request $request, Need $need): RedirectResponse
    {
        $this->authorize('approve', $need);

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'is_approved' => 'required|boolean',
        ]);

        $need->update([
            'notes' => $validated['notes'],
            'approved_by_director_at' => $validated['is_approved'] ? now() : null,
        ]);

        return back()->with('success', 'Review direktur berhasil diperbarui.');
    }
}
