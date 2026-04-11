<?php

namespace App\Http\Controllers\Renstra;

use App\Http\Controllers\Controller;
use App\Http\Requests\Renstra\StoreRenstraRequest;
use App\Http\Requests\Renstra\UpdateRenstraRequest;
use App\Models\Renstra;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RenstraController extends Controller
{
    use HasDataTable;

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['name', 'description', 'year_start', 'year_end'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['name', 'year_start', 'year_end', 'is_active', 'created_at'];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $renstras = $this->applyDataTable(
            Renstra::query(),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('renstra/renstras/index', [
            'renstras' => $renstras,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRenstraRequest $request)
    {
        Renstra::create($request->validated());

        return redirect()->back()
            ->with('success', 'Renstra berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRenstraRequest $request, Renstra $renstra)
    {
        $renstra->update($request->validated());

        return redirect()->back()
            ->with('success', 'Renstra berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Renstra $renstra)
    {
        $renstra->delete();

        return redirect()->back()
            ->with('success', 'Renstra berhasil dihapus.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Renstra $renstra): Response
    {
        return Inertia::render('renstra/renstras/show', [
            'renstra' => $renstra->load('tujuans.indicators.targets', 'tujuans.sasarans.indicators.targets'),
        ]);
    }
}
