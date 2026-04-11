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

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['name', 'code'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['name', 'code', 'created_at'];

    public function index(Request $request): Response
    {
        $units = $this->applyDataTable(
            OrganizationalUnit::query()->with('parent'),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('organizational-units/index', [
            'units' => $units,
            'allUnits' => OrganizationalUnit::query()->select(['id', 'name'])->get(),
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    public function store(StoreOrganizationalUnitRequest $request)
    {
        OrganizationalUnit::create($request->validated());

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil dibuat.');
    }

    public function update(UpdateOrganizationalUnitRequest $request, OrganizationalUnit $organizationalUnit)
    {
        $organizationalUnit->update($request->validated());

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil diperbarui.');
    }

    public function destroy(OrganizationalUnit $organizationalUnit)
    {
        $organizationalUnit->delete();

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil dihapus.');
    }
}
