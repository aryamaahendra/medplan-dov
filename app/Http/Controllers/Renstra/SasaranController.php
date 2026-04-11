<?php

namespace App\Http\Controllers\Renstra;

use App\Http\Controllers\Controller;
use App\Http\Requests\Renstra\StoreSasaranRequest;
use App\Http\Requests\Renstra\UpdateSasaranRequest;
use App\Models\Sasaran;

class SasaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSasaranRequest $request)
    {
        Sasaran::create($request->validated());

        return back()->with('success', 'Sasaran berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sasaran $sasaran)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSasaranRequest $request, Sasaran $sasaran)
    {
        $sasaran->update($request->validated());

        return back()->with('success', 'Sasaran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sasaran $sasaran)
    {
        $sasaran->delete();

        return back()->with('success', 'Sasaran berhasil dihapus.');
    }
}
