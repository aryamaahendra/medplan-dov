<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\StoreOrganizationalUnitRequest;
use App\Http\Requests\Management\UpdateOrganizationalUnitRequest;
use App\Models\OrganizationalUnit;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationalUnitController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        //
    }

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['name', 'code'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['name', 'code', 'created_at'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', OrganizationalUnit::class);
        $units = $this->applyDataTable(
            OrganizationalUnit::query()->with('parent'),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('management/organizational-units/index', [
            'units' => $units,
            'allUnits' => OrganizationalUnit::query()->select(['id', 'name'])->get(),
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    public function store(StoreOrganizationalUnitRequest $request)
    {
        $this->authorize('create', OrganizationalUnit::class);
        OrganizationalUnit::create($request->validated());

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil dibuat.');
    }

    public function update(UpdateOrganizationalUnitRequest $request, OrganizationalUnit $organizationalUnit)
    {
        $this->authorize('update', $organizationalUnit);
        $organizationalUnit->update($request->validated());

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil diperbarui.');
    }

    public function destroy(OrganizationalUnit $organizationalUnit)
    {
        $this->authorize('delete', $organizationalUnit);
        $organizationalUnit->delete();

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil dihapus.');
    }
}
