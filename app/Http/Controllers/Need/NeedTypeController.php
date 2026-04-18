<?php

namespace App\Http\Controllers\Need;

use App\Http\Controllers\Controller;
use App\Http\Requests\Need\StoreNeedTypeRequest;
use App\Http\Requests\Need\UpdateNeedTypeRequest;
use App\Models\NeedType;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NeedTypeController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        //
    }

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['name', 'code', 'description'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['name', 'code', 'is_active', 'order_column', 'created_at'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', NeedType::class);
        $needTypes = $this->applyDataTable(
            NeedType::query()
                ->orderBy('order_column', 'asc')
                ->orderBy('name', 'asc'),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('need/types/index', [
            'needTypes' => $needTypes,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    public function store(StoreNeedTypeRequest $request)
    {
        $this->authorize('create', NeedType::class);
        NeedType::create($request->validated());

        return redirect()->route('need-types.index')
            ->with('success', 'Kategori kebutuhan berhasil dibuat.');
    }

    public function update(UpdateNeedTypeRequest $request, NeedType $needType)
    {
        $this->authorize('update', $needType);
        $needType->update($request->validated());

        return redirect()->route('need-types.index')
            ->with('success', 'Kategori kebutuhan berhasil diperbarui.');
    }

    public function destroy(NeedType $needType)
    {
        $this->authorize('delete', $needType);
        $needType->delete();

        return redirect()->route('need-types.index')
            ->with('success', 'Kategori kebutuhan berhasil dihapus.');
    }
}
