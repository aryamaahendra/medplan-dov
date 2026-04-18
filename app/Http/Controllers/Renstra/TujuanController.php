<?php

namespace App\Http\Controllers\Renstra;

use App\Http\Controllers\Controller;
use App\Http\Requests\Renstra\StoreTujuanRequest;
use App\Http\Requests\Renstra\UpdateTujuanRequest;
use App\Models\Tujuan;

class TujuanController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Tujuan::class);
    }

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
    public function store(StoreTujuanRequest $request)
    {
        Tujuan::create($request->validated());

        return back()->with('success', 'Tujuan berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tujuan $tujuan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTujuanRequest $request, Tujuan $tujuan)
    {
        $tujuan->update($request->validated());

        return back()->with('success', 'Tujuan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tujuan $tujuan)
    {
        $tujuan->delete();

        return back()->with('success', 'Tujuan berhasil dihapus.');
    }
}
