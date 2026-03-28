<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNeedRequest;
use App\Http\Requests\UpdateNeedRequest;
use App\Models\Need;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
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
                ->with(['organizationalUnit:id,name', 'needType:id,name'])
                ->orderBy('created_at', 'desc'),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('needs/index', [
            'needs' => $needs,
            'organizationalUnits' => OrganizationalUnit::query()->select(['id', 'name'])->get(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    public function store(StoreNeedRequest $request)
    {
        Need::create($request->validated());

        return redirect()->route('needs.index')
            ->with('success', 'Usulan kebutuhan berhasil dibuat.');
    }

    public function update(UpdateNeedRequest $request, Need $need)
    {
        $need->update($request->validated());

        return redirect()->route('needs.index')
            ->with('success', 'Usulan kebutuhan berhasil diperbarui.');
    }

    public function destroy(Need $need)
    {
        $need->delete();

        return redirect()->route('needs.index')
            ->with('success', 'Usulan kebutuhan berhasil dihapus.');
    }
}
