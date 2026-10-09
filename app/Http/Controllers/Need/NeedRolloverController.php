<?php

declare(strict_types=1);

namespace App\Http\Controllers\Need;

use App\Actions\Need\RolloverNeedAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Need\BulkRolloverNeedRequest;
use App\Http\Resources\NeedResource;
use App\Models\Need;
use App\Models\NeedGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class NeedRolloverController extends Controller
{
    /**
     * Get candidate unapproved needs eligible for rollover into the target need group.
     */
    public function candidates(Request $request): JsonResponse
    {
        $request->validate([
            'target_need_group_id' => ['nullable', 'integer', 'exists:need_groups,id'],
            'search' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer'],
            'need_type_id' => ['nullable', 'integer'],
            'organizational_unit_id' => ['nullable', 'integer'],
        ]);

        $targetGroupId = $request->filled('target_need_group_id') ? (int) $request->input('target_need_group_id') : null;
        $user = $request->user();

        $query = Need::query()
            ->unapprovedCandidates($targetGroupId, $user)
            ->with([
                'needGroup:id,name,year',
                'organizationalUnit:id,name',
                'needType:id,name',
            ])
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->input('search').'%';
                $q->where(function ($sub) use ($term) {
                    $sub->where('title', 'like', $term)
                        ->orWhere('description', 'like', $term);
                });
            })
            ->when($request->filled('year'), fn ($q) => $q->where('year', $request->input('year')))
            ->when($request->filled('need_type_id'), fn ($q) => $q->where('need_type_id', $request->input('need_type_id')))
            ->when($request->filled('organizational_unit_id'), fn ($q) => $q->where('organizational_unit_id', $request->input('organizational_unit_id')))
            ->orderByDesc('year')
            ->orderByDesc('created_at');

        $paginated = $query->paginate(20);

        return response()->json([
            'data' => $paginated->items(),
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'total' => $paginated->total(),
        ]);
    }

    /**
     * Get full details of an unapproved need to prefill the Need creation form.
     */
    public function sourceDetail(Need $need): JsonResponse
    {
        $this->authorize('view', $need);

        $need->loadMissing([
            'needGroup:id,name,year',
            'organizationalUnit:id,name',
            'needType:id,name',
            'sasarans:id',
            'indicators:id',
            'kpiIndicators:id',
            'strategicServicePlans:id',
            'planningActivityVersions:id',
            'planningActivityIndicators:id',
            'detail.fundingSources:id',
            'attachments',
        ]);

        return response()->json([
            'data' => NeedResource::make($need)->resolve(),
        ]);
    }

    /**
     * Bulk rollover unapproved needs into a target need group.
     */
    public function bulkRollover(
        BulkRolloverNeedRequest $request,
        NeedGroup $needGroup,
        RolloverNeedAction $action
    ): RedirectResponse {
        $this->authorize('create', [Need::class, $needGroup]);

        $validated = $request->validated();
        $rolledOver = $action->executeMany($validated['need_ids'], $needGroup, $request->user());

        return redirect()->back()
            ->with('success', count($rolledOver).' usulan berhasil ditarik ke kelompok ini.');
    }
}
