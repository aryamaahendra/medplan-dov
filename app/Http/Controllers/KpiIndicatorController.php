<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreKpiIndicatorRequest;
use App\Http\Requests\UpdateKpiIndicatorRequest;
use App\Models\KpiIndicator;
use Illuminate\Support\Facades\DB;

class KpiIndicatorController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreKpiIndicatorRequest $request)
    {
        DB::transaction(function () use ($request) {
            $indicator = KpiIndicator::create($request->validated());

            if ($request->has('annual_targets')) {
                foreach ($request->input('annual_targets') as $target) {
                    $indicator->annualTargets()->create($target);
                }
            }
        });

        return back()->with('success', 'KPI Indikator berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateKpiIndicatorRequest $request, KpiIndicator $indicator)
    {
        DB::transaction(function () use ($request, $indicator) {
            $indicator->update($request->validated());

            if ($request->has('annual_targets')) {
                foreach ($request->input('annual_targets') as $target) {
                    $indicator->annualTargets()->updateOrCreate(
                        ['year' => $target['year']],
                        ['target_value' => $target['target_value']]
                    );
                }
            }
        });

        return back()->with('success', 'KPI Indikator berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(KpiIndicator $indicator)
    {
        $indicator->delete();

        return back()->with('success', 'KPI Indikator berhasil dihapus.');
    }
}
