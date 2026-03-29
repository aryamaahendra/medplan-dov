<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIndicatorRequest;
use App\Http\Requests\UpdateIndicatorRequest;
use App\Models\Indicator;
use Illuminate\Support\Facades\DB;

class IndicatorController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreIndicatorRequest $request)
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
    public function update(UpdateIndicatorRequest $request, Indicator $indicator)
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
    public function destroy(Indicator $indicator)
    {
        $indicator->delete();

        return back()->with('success', 'Indikator berhasil dihapus.');
    }
}
