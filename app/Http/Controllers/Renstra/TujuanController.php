<?php

declare(strict_types=1);

namespace App\Http\Controllers\Renstra;

use App\Http\Controllers\Controller;
use App\Http\Requests\Renstra\StoreTujuanRequest;
use App\Http\Requests\Renstra\UpdateTujuanRequest;
use App\Models\Tujuan;
use Illuminate\Http\RedirectResponse;

final class TujuanController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Tujuan::class);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTujuanRequest $request): RedirectResponse
    {
        Tujuan::create($request->validated());

        return back()->with('success', 'Tujuan berhasil dibuat.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTujuanRequest $request, Tujuan $tujuan): RedirectResponse
    {
        $tujuan->update($request->validated());

        return back()->with('success', 'Tujuan berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tujuan $tujuan): RedirectResponse
    {
        $tujuan->delete();

        return back()->with('success', 'Tujuan berhasil dihapus.');
    }
}
