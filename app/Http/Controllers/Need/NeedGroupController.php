<?php

namespace App\Http\Controllers\Need;

use App\Http\Controllers\Controller;
use App\Http\Requests\Need\StoreNeedGroupRequest;
use App\Http\Requests\Need\UpdateNeedGroupRequest;
use App\Models\NeedGroup;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NeedGroupController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        //
    }

    private const array SEARCH_COLUMNS = ['name', 'description'];

    private const array SORTABLE_COLUMNS = ['name', 'year', 'is_active', 'need_count', 'total_budget', 'approved_count', 'priority_count', 'created_at'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', NeedGroup::class);
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
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    public function store(StoreNeedGroupRequest $request)
    {
        $this->authorize('create', NeedGroup::class);
        NeedGroup::create($request->validated());

        return redirect()->back()
            ->with('success', 'Kelompok usulan berhasil dibuat.');
    }

    public function update(UpdateNeedGroupRequest $request, NeedGroup $needGroup)
    {
        $this->authorize('update', $needGroup);
        $needGroup->update($request->validated());

        return redirect()->back()
            ->with('success', 'Kelompok usulan berhasil diperbarui.');
    }

    public function destroy(NeedGroup $needGroup)
    {
        $this->authorize('delete', $needGroup);
        $needGroup->delete();

        return redirect()->back()
            ->with('success', 'Kelompok usulan berhasil dihapus.');
    }
}
