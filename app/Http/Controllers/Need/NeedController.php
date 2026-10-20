<?php

declare(strict_types=1);

namespace App\Http\Controllers\Need;

use App\Actions\Need\GetFilteredNeedsAction;
use App\Actions\Need\NeedLockLifecycle;
use App\Actions\Need\NeedProposalEngine;
use App\Actions\Need\NeedStrategicAlignmentEngine;
use App\DTOs\Need\DirectorDetermination;
use App\DTOs\Need\NeedProposalPayload;
use App\Enums\Kldi;
use App\Enums\SatkerSkpd;
use App\Http\Controllers\Controller;
use App\Http\Requests\Need\StoreNeedRequest;
use App\Http\Requests\Need\UpdateDirectorReviewRequest;
use App\Http\Requests\Need\UpdateNeedRequest;
use App\Http\Resources\ChecklistQuestionResource;
use App\Http\Resources\NeedChecklistAnswerResource;
use App\Http\Resources\NeedResource;
use App\Models\FundingSource;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\User;
use App\Traits\HasDataTable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class NeedController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        //
    }

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['title', 'description'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['title', 'year', 'status', 'total_price', 'checklist_percentage', 'created_at'];

    public function index(
        Request $request,
        GetFilteredNeedsAction $action
    ): Response|RedirectResponse {
        $this->authorize('viewAny', Need::class);
        $groupId = $request->input('need_group_id');

        if (! $groupId) {
            $firstGroup = NeedGroup::query()->where('is_active', true)->orderByDesc('year')->first();
            if ($firstGroup) {
                return redirect()->route('needs.index', ['need_group_id' => $firstGroup->id]);
            }
        }

        $currentGroup = $groupId ? NeedGroup::query()->find($groupId) : null;

        $filters = [
            'year' => $request->input('year'),
            'status' => $request->input('status'),
            'need_type_id' => $request->input('need_type_id'),
            'organizational_unit_id' => $request->input('organizational_unit_id'),
            'urgency' => $request->input('urgency'),
            'impact' => $request->input('impact'),
            'is_priority' => $request->input('is_priority'),
            'is_approved_by_director' => $request->input('is_approved_by_director'),
            'is_recommended_for_next_cycle' => $request->input('is_recommended_for_next_cycle'),
            'min_checklist_score' => $request->input('min_checklist_score'),
            'stage' => $request->input('stage'),
            'need_group_id' => $groupId,
            'attention' => $request->input('attention'),
            'include_descendants' => $request->boolean('include_descendants'),
        ];
        $counts = $action->getIndexCounts(
            $filters,
            $request->user(),
            $currentGroup,
            $request->string('search')->trim()->value() ?: null
        );

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
            'stageCounts' => $counts['stageCounts'],
            'attentionCounts' => $counts['attentionCounts'],
            'organizationalUnits' => $this->activeOrganizationalUnits(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
            'filters' => array_merge($this->dataTableFilters($request), $filters),
        ]);
    }

    public function store(StoreNeedRequest $request, NeedProposalEngine $engine): RedirectResponse
    {
        $needGroup = NeedGroup::query()->find($request->input('need_group_id'));
        $this->authorize('create', [Need::class, $needGroup]);

        $payload = NeedProposalPayload::fromArray(
            data: $request->validated(),
            attachments: $request->file('attachments') ?? [],
            attachmentNames: (array) $request->input('attachment_names', []),
            technicalSpecificationAttachments: $request->file('technical_specification_attachments') ?? [],
            technicalSpecificationAttachmentNames: (array) $request->input('technical_specification_attachment_names', []),
        );
        if ($payload->shouldSubmit) {
            $prototypeNeed = new Need($payload->attributes);
            $prototypeNeed->status = Need::STATUS_DRAFT;
            $prototypeNeed->setRelation('needGroup', $needGroup);
            $this->authorize('submit', $prototypeNeed);
        }

        $need = $engine->submit($payload, $request->user());
        $message = $payload->shouldSubmit
            ? 'Usulan kebutuhan berhasil dibuat dan diajukan.'
            : 'Usulan kebutuhan berhasil dibuat.';

        return redirect()->route('needs.index', ['need_group_id' => $need->need_group_id])
            ->with('success', $message);
    }

    public function create(Request $request, NeedStrategicAlignmentEngine $alignmentEngine): Response
    {
        $groupId = $request->input('need_group_id');
        $currentGroup = $groupId ? NeedGroup::findOrFail($groupId) : null;
        $this->authorize('create', [Need::class, $currentGroup]);

        return Inertia::render('need/needs/create', [
            'currentGroup' => $currentGroup,
            'organizationalUnits' => $this->activeOrganizationalUnits(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
            ...$alignmentEngine->loadFormOptions(),
            'fundingSources' => FundingSource::query()->select(['id', 'name'])->orderBy('name')->get(),
            'users' => User::query()->select(['id', 'name', 'nip'])->orderBy('name')->get(),
            'kldiOptions' => collect(Kldi::cases())->map(fn ($case) => ['name' => $case->value, 'value' => $case->value])->values()->all(),
            'satkerOptions' => collect(SatkerSkpd::cases())->map(fn ($case) => ['name' => $case->value, 'value' => $case->value])->values()->all(),
        ]);
    }

    public function edit(Need $need, NeedStrategicAlignmentEngine $alignmentEngine): Response
    {
        $this->authorize('view', $need);

        return Inertia::render('need/needs/edit', [
            'need' => NeedResource::make($need->load([
                'needGroup',
                'organizationalUnit:id,name,parent_id',
                'sasarans:id',
                'indicators:id',
                'kpiIndicators:id',
                'strategicServicePlans:id',
                'planningActivityVersions:id',
                'planningActivityIndicators:id',
                'detail.fundingSources',
                'detail.kpa',
                'attachments',
            ]))->resolve(),
            'currentGroup' => $need->needGroup,
            'organizationalUnits' => $this->activeOrganizationalUnits(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
            ...$alignmentEngine->loadFormOptions(),
            'fundingSources' => FundingSource::query()->select(['id', 'name'])->orderBy('name')->get(),
            'users' => User::query()->select(['id', 'name', 'nip'])->orderBy('name')->get(),
            'kldiOptions' => collect(Kldi::cases())->map(fn ($case) => ['name' => $case->value, 'value' => $case->value])->values()->all(),
            'satkerOptions' => collect(SatkerSkpd::cases())->map(fn ($case) => ['name' => $case->value, 'value' => $case->value])->values()->all(),
        ]);
    }

    public function update(UpdateNeedRequest $request, Need $need, NeedProposalEngine $engine): RedirectResponse
    {
        $this->authorize('update', $need);

        $payload = NeedProposalPayload::fromArray(
            data: $request->validated(),
            attachments: $request->file('attachments') ?? [],
            attachmentNames: (array) $request->input('attachment_names', []),
            technicalSpecificationAttachments: $request->file('technical_specification_attachments') ?? [],
            technicalSpecificationAttachmentNames: (array) $request->input('technical_specification_attachment_names', []),
        );

        if ($payload->shouldSubmit) {
            if (! in_array($need->status, [Need::STATUS_DRAFT, Need::STATUS_REVISION], true)) {
                throw ValidationException::withMessages([
                    'status' => 'Hanya usulan berstatus draft atau revisi yang dapat diajukan.',
                ]);
            }

            $this->authorize('submit', $need);
        }

        $engine->update($need, $payload, $request->user());

        $message = $payload->shouldSubmit
            ? 'Usulan kebutuhan berhasil diperbarui dan diajukan.'
            : 'Usulan kebutuhan berhasil diperbarui.';

        return redirect()->route('needs.index', ['need_group_id' => $need->need_group_id])
            ->with('success', $message);
    }

    public function show(Need $need): Response
    {
        $this->authorize('view', $need);

        return Inertia::render('need/needs/show', [
            'need' => NeedResource::make($need->load([
                'needGroup',
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
                'detail.fundingSources',
                'detail.kpa',
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

    public function updateDirectorReview(
        UpdateDirectorReviewRequest $request,
        Need $need,
        NeedLockLifecycle $lifecycle
    ): RedirectResponse {
        $this->authorize('approve', $need);

        $validated = $request->validated();

        $decision = $validated['decision'];

        if ($decision === Need::STATUS_APPROVED) {
            $lifecycle->approveByDirector(
                need: $need,
                notes: $validated['notes'] ?? null,
                approver: $request->user(),
                determination: DirectorDetermination::fromArray($validated),
            );
        } elseif ($decision === Need::STATUS_REJECTED) {
            $lifecycle->rejectByDirector(
                need: $need,
                notes: $validated['notes'] ?? null,
                actor: $request->user(),
                isRecommendedForNextCycle: (bool) ($validated['is_recommended_for_next_cycle'] ?? false),
            );
        } else {
            $lifecycle->revisionByDirector(
                need: $need,
                notes: (string) $validated['notes'],
                actor: $request->user(),
            );
        }

        return back()->with('success', 'Review direktur berhasil diperbarui.');
    }

    public function submit(Request $request, Need $need, NeedLockLifecycle $lifecycle): RedirectResponse
    {
        if (! in_array($need->status, [Need::STATUS_DRAFT, Need::STATUS_REVISION], true)) {
            throw ValidationException::withMessages([
                'status' => 'Hanya usulan dengan status draft atau revisi yang dapat diajukan.',
            ]);
        }

        $this->authorize('submit', $need);

        $lifecycle->submit($need, $request->user());

        return back()->with('success', 'Usulan kebutuhan berhasil diajukan.');
    }

    /**
     * Get active organizational units for form dropdowns.
     *
     * @return Collection<int, OrganizationalUnit>
     */
    private function activeOrganizationalUnits()
    {
        return OrganizationalUnit::query()
            ->whereNull('deleted_at')
            ->select(['id', 'name', 'parent_id'])
            ->get();
    }
}
