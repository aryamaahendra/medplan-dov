<?php

namespace App\Http\Controllers\Management;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Management\StoreRoleRequest;
use App\Http\Requests\Management\UpdateRoleRequest;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        //
    }

    private const array SEARCH_COLUMNS = ['name'];

    private const array SORTABLE_COLUMNS = ['name', 'created_at'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Role::class);
        $roles = $this->applyDataTable(
            Role::with('permissions'),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('management/roles/index', [
            'roles' => $roles,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Role::class);
        $permissions = Permission::all();

        return Inertia::render('management/roles/create', [
            'permissions' => $permissions,
        ]);
    }

    public function edit(Role $role): Response
    {
        $this->authorize('update', $role);
        $role->load('permissions');
        $permissions = Permission::all();

        return Inertia::render('management/roles/edit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    public function store(StoreRoleRequest $request)
    {
        $this->authorize('create', Role::class);
        $role = Role::create(['name' => $request->validated('name')]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->validated('permissions'));
        }

        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $this->authorize('update', $role);
        if (strtolower($role->name) === UserRole::SuperAdmin->value && strtolower($request->validated('name')) !== UserRole::SuperAdmin->value) {
            return redirect()->back()->with('error', 'Cannot rename Superadmin role.');
        }

        $role->update(['name' => $request->validated('name')]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->validated('permissions'));
        }

        return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);
        if (strtolower($role->name) === UserRole::SuperAdmin->value) {
            return redirect()->back()->with('error', 'Cannot delete Superadmin role.');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
