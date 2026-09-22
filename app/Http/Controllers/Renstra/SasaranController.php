<?php

declare(strict_types=1);

namespace App\Http\Controllers\Renstra;

use App\Http\Controllers\Controller;
use App\Http\Requests\Renstra\StoreSasaranRequest;
use App\Http\Requests\Renstra\UpdateSasaranRequest;
use App\Models\Sasaran;
use Illuminate\Http\RedirectResponse;

class SasaranController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Sasaran::class);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSasaranRequest $request): RedirectResponse
    {
        Sasaran::create($request->validated());

        return back()->with('success', 'Sasaran berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSasaranRequest $request, Sasaran $sasaran): RedirectResponse
    {
        $sasaran->update($request->validated());

        return back()->with('success', 'Sasaran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sasaran $sasaran): RedirectResponse
    {
        $sasaran->delete();

        return back()->with('success', 'Sasaran berhasil dihapus.');
    }
}
