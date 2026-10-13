<?php

declare(strict_types=1);

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\StoreOrganizationalUnitRequest;
use App\Http\Requests\Management\UpdateOrganizationalUnitRequest;
use App\Models\OrganizationalUnit;
use App\Traits\HasDataTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class OrganizationalUnitController extends Controller
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

        $isTrash = $request->boolean('trash');
        $query = $isTrash
            ? OrganizationalUnit::onlyTrashed()->with('parent')
            : OrganizationalUnit::query()->with('parent');

        $units = $this->applyDataTable(
            $query,
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        $user = $request->user();
        $units->through(fn (OrganizationalUnit $unit): array => [
            'id' => $unit->id,
            'name' => $unit->name,
            'code' => $unit->code,
            'parent_id' => $unit->parent_id,
            'parent' => $unit->parent ? [
                'id' => $unit->parent->id,
                'name' => $unit->parent->name,
                'code' => $unit->parent->code,
            ] : null,
            'created_at' => $unit->created_at?->toISOString(),
            'deleted_at' => $unit->deleted_at?->toISOString(),
            'can' => [
                'update' => $user?->can('update', $unit) ?? false,
                'delete' => $user?->can('delete', $unit) ?? false,
                'restore' => $user?->can('restore', $unit) ?? false,
                'forceDelete' => $user?->can('forceDelete', $unit) ?? false,
            ],
        ]);

        return Inertia::render('management/organizational-units/index', [
            'units' => $units,
            'allUnits' => OrganizationalUnit::query()->select(['id', 'name'])->get(),
            'filters' => array_merge($this->dataTableFilters($request), [
                'trash' => $isTrash,
            ]),
        ]);
    }

    public function store(StoreOrganizationalUnitRequest $request): RedirectResponse
    {
        $this->authorize('create', OrganizationalUnit::class);
        OrganizationalUnit::create($request->validated());

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil dibuat.');
    }

    public function update(UpdateOrganizationalUnitRequest $request, OrganizationalUnit $organizationalUnit): RedirectResponse
    {
        $this->authorize('update', $organizationalUnit);
        $organizationalUnit->update($request->validated());

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil diperbarui.');
    }

    public function destroy(OrganizationalUnit $organizationalUnit): RedirectResponse
    {
        $this->authorize('delete', $organizationalUnit);

        if ($organizationalUnit->children()->exists()) {
            throw ValidationException::withMessages([
                'error' => 'Unit organisasi tidak dapat dihapus karena masih memiliki unit bawahan aktif.',
            ]);
        }

        if ($organizationalUnit->users()->exists()) {
            throw ValidationException::withMessages([
                'error' => 'Unit organisasi tidak dapat dihapus karena masih memiliki pengguna aktif yang terdaftar.',
            ]);
        }

        $organizationalUnit->delete();

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil dihapus.');
    }

    public function restore(int $id): RedirectResponse
    {
        /** @var OrganizationalUnit $unit */
        $unit = OrganizationalUnit::onlyTrashed()->findOrFail($id);

        $this->authorize('restore', $unit);

        if ($unit->parent_id !== null) {
            $parentIsActive = OrganizationalUnit::query()
                ->where('id', $unit->parent_id)
                ->exists();

            if (! $parentIsActive) {
                $unit->parent_id = null;
                $unit->save();
            }
        }

        $unit->restore();

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil dipulihkan.');
    }

    public function forceDelete(int $id): RedirectResponse
    {
        /** @var OrganizationalUnit $unit */
        $unit = OrganizationalUnit::onlyTrashed()->findOrFail($id);

        $this->authorize('forceDelete', $unit);

        if ($unit->needs()->exists()) {
            throw ValidationException::withMessages([
                'error' => 'Unit organisasi tidak dapat dihapus permanen karena masih memiliki riwayat usulan kebutuhan.',
            ]);
        }

        if ($unit->users()->exists()) {
            throw ValidationException::withMessages([
                'error' => 'Unit organisasi tidak dapat dihapus permanen karena masih memiliki pengguna terdaftar.',
            ]);
        }

        $unit->forceDelete();

        return redirect()->route('organizational-units.index')
            ->with('success', 'Unit organisasi berhasil dihapus secara permanen.');
    }
}
