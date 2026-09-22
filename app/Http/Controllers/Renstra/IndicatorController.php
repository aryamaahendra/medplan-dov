<?php

declare(strict_types=1);

namespace App\Http\Controllers\Renstra;

use App\Http\Controllers\Controller;
use App\Http\Requests\Renstra\StoreIndicatorRequest;
use App\Http\Requests\Renstra\UpdateIndicatorRequest;
use App\Models\Indicator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class IndicatorController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Indicator::class);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreIndicatorRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $indicator = Indicator::create($request->validated());
            $indicator->targets()->createMany($request->validated()['targets']);
        });

        return back()->with('success', 'Indikator berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateIndicatorRequest $request, Indicator $indicator): RedirectResponse
    {
        DB::transaction(function () use ($request, $indicator) {
            $indicator->update($request->validated());
            $indicator->targets()->delete();
            $indicator->targets()->createMany($request->validated()['targets']);
        });

        return back()->with('success', 'Indikator berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Indicator $indicator): RedirectResponse
    {
        $indicator->delete();

        return back()->with('success', 'Indikator berhasil dihapus.');
    }
}
