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
                ->when($request->input('year'), fn ($q, $v) => $q->whereIn('year', (array) $v))
                ->when($request->input('status'), fn ($q, $v) => $q->whereIn('status', (array) $v))
                ->when($request->input('need_type_id'), fn ($q, $v) => $q->whereIn('need_type_id', (array) $v))
                ->when($request->input('organizational_unit_id'), fn ($q, $v) => $q->whereIn('organizational_unit_id', (array) $v))
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
            ]),
        ]);
    }

    public function store(StoreNeedRequest $request)
    {
        Need::create($request->validated());

        return redirect()->route('needs.index')
            ->with('success', 'Usulan kebutuhan berhasil dibuat.');
    }

    public function create(): Response
    {
        return Inertia::render('needs/create', [
            'organizationalUnits' => OrganizationalUnit::query()->select(['id', 'name'])->get(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
        ]);
    }

    public function edit(Need $need): Response
    {
        return Inertia::render('needs/edit', [
            'need' => $need,
            'organizationalUnits' => OrganizationalUnit::query()->select(['id', 'name'])->get(),
            'needTypes' => NeedType::query()->where('is_active', true)->select(['id', 'name'])->orderBy('order_column')->get(),
        ]);
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
