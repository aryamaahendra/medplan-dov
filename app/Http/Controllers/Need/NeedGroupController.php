<?php

declare(strict_types=1);

namespace App\Http\Controllers\Need;

use App\Actions\Need\RolloverNeedAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Need\StoreNeedGroupRequest;
use App\Http\Requests\Need\UpdateNeedGroupRequest;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Traits\HasDataTable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class NeedGroupController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        //
    }

    private const array SEARCH_COLUMNS = ['name', 'description'];

    private const array SORTABLE_COLUMNS = ['name', 'year', 'is_active', 'need_count', 'total_budget', 'approved_count', 'priority_count', 'submission_start_at', 'submission_end_at', 'created_at'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', NeedGroup::class);
        $baseQuery = NeedGroup::query();
        $search = $request->string('search')->trim()->value();
        if ($search !== '') {
            $baseQuery->where(function (Builder $q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        /** @var object{total_groups?: int|string, active_groups?: int|string}|null $groupsAggregate */
        $groupsAggregate = (clone $baseQuery)
            ->toBase()
            ->selectRaw('
                COUNT(*) as total_groups,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_groups
            ')
            ->first();

        $matchingGroupIds = (clone $baseQuery)->select('id');

        /** @var object{total_needs?: int|string, total_approved?: int|string, total_budget?: int|float|string}|null $needsAggregate */
        $needsAggregate = Need::query()
            ->whereIn('need_group_id', $matchingGroupIds)
            ->toBase()
            ->selectRaw('
                COUNT(*) as total_needs,
                COUNT(CASE WHEN approved_by_director_at IS NOT NULL THEN 1 END) as total_approved,
                COALESCE(SUM(total_price), 0) as total_budget
            ')
            ->first();

        $endYear = (int) max(now()->year, (clone $baseQuery)->max('year') ?? now()->year);
        $startYear = $endYear - 4;
        $years = range($startYear, $endYear);

        $yearlyData = DB::table('need_groups as ng')
            ->whereIn('ng.id', (clone $baseQuery)->select('id'))
            ->whereBetween('ng.year', [$startYear, $endYear])
            ->leftJoin('needs as n', function ($join): void {
                $join->on('n.need_group_id', '=', 'ng.id')
                    ->whereNull('n.deleted_at');
            })
            ->groupBy('ng.year')
            ->selectRaw('
                ng.year,
                COUNT(n.id) as total_needs,
                COALESCE(SUM(n.total_price), 0) as total_budget
            ')
            ->get()
            ->keyBy('year');

        $fiveYearTrends = collect($years)->map(function (int $yr) use ($yearlyData): array {
            $row = $yearlyData->get($yr);

            return [
                'year' => $yr,
                'total_needs' => (int) ($row->total_needs ?? 0),
                'total_budget' => (float) ($row->total_budget ?? 0),
            ];
        })->values()->all();

        $summaryStats = [
            'total_groups' => (int) ($groupsAggregate->total_groups ?? 0),
            'active_groups' => (int) ($groupsAggregate->active_groups ?? 0),
            'total_needs' => (int) ($needsAggregate->total_needs ?? 0),
            'total_approved' => (int) ($needsAggregate->total_approved ?? 0),
            'total_budget' => (float) ($needsAggregate->total_budget ?? 0),
            'yearly_trends' => $fiveYearTrends,
        ];

        $needGroups = $this->applyDataTable(
            NeedGroup::query()
                ->withSum('needs as total_budget', 'total_price')
                ->withCount([
                    'needs as approved_count' => fn ($query) => $query->whereNotNull('approved_by_director_at'),
                    'needs as priority_count' => fn ($query) => $query->where('is_priority', true),
                ]),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('need/groups/index', [
            'needGroups' => $needGroups,
            'summaryStats' => $summaryStats,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    public function store(StoreNeedGroupRequest $request, RolloverNeedAction $rolloverAction): RedirectResponse
    {
        $this->authorize('create', NeedGroup::class);
        $validated = $request->validated();
        $carryOverIds = $validated['carry_over_need_ids'] ?? [];
        unset($validated['carry_over_need_ids']);

        $needGroup = NeedGroup::create($validated);

        if (! empty($carryOverIds)) {
            $rolloverAction->executeMany($carryOverIds, $needGroup, $request->user());
        }

        return redirect()->back()
            ->with('success', 'Kelompok usulan berhasil dibuat.');
    }

    public function update(UpdateNeedGroupRequest $request, NeedGroup $needGroup): RedirectResponse
    {
        $this->authorize('update', $needGroup);
        $needGroup->update($request->validated());

        return redirect()->back()
            ->with('success', 'Kelompok usulan berhasil diperbarui.');
    }

    public function destroy(NeedGroup $needGroup): RedirectResponse
    {
        $this->authorize('delete', $needGroup);
        $needGroup->delete();

        return redirect()->back()
            ->with('success', 'Kelompok usulan berhasil dihapus.');
    }
}
