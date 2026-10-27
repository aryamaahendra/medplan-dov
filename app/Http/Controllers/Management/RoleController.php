<?php

declare(strict_types=1);

namespace App\Http\Controllers\Management;

use App\Actions\Management\GroupPermissionsAction;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Management\StoreRoleRequest;
use App\Http\Requests\Management\UpdateRoleMatrixRequest;
use App\Http\Requests\Management\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

final class RoleController extends Controller
{
    public function __construct()
    {
        //
    }

    public function index(Request $request, GroupPermissionsAction $groupPermissionsAction): Response
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::with('permissions:id,name')
            ->withCount('users')
            ->orderByRaw('CASE WHEN LOWER(name) = ? THEN 0 ELSE 1 END', [UserRole::SuperAdmin->value])
            ->orderBy('name')
            ->get();

        $permissions = Permission::query()
            ->select(['id', 'name', 'guard_name', 'description'])
            ->orderBy('name')
            ->get();

        $groupedPermissions = $groupPermissionsAction->handle($permissions);

        return Inertia::render('management/roles/index', [
            'roles' => $roles,
            'groupedPermissions' => $groupedPermissions,
            'currentUserRoleIds' => $request->user()?->roles->pluck('id')->all() ?? [],
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

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $this->authorize('create', Role::class);
        $role = Role::create(['name' => $request->validated('name')]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->validated('permissions'));
        }

        return redirect()->route('roles.index')->with('success', 'Role created successfully.');
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
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

    public function updateMatrix(UpdateRoleMatrixRequest $request): RedirectResponse
    {
        $this->authorize('updateAny', Role::class);

        $user = $request->user();
        $isSuperAdmin = $user && $user->hasRole(UserRole::SuperAdmin->value);
        /** @var array<int|string, array<int>> $matrix */
        $matrix = $request->validated('matrix');

        if (! $isSuperAdmin && $user) {
            $userRoleIds = $user->roles->pluck('id')->all();
            $criticalPermissionNames = ['view any roles', 'update roles'];
            $criticalPermissionIds = Permission::whereIn('name', $criticalPermissionNames)->pluck('id')->all();

            foreach ($userRoleIds as $userRoleId) {
                if (isset($matrix[$userRoleId])) {
                    $assignedIds = array_map('intval', $matrix[$userRoleId]);
                    $missingCritical = array_diff($criticalPermissionIds, $assignedIds);
                    if (! empty($missingCritical)) {
                        return redirect()->back()->with('error', 'You cannot revoke critical role management permissions from your own active role.');
                    }
                }
            }
        }

        DB::transaction(function () use ($matrix) {
            foreach ($matrix as $roleId => $permissionIds) {
                $role = Role::find($roleId);
                if (! $role) {
                    continue;
                }

                if (strtolower($role->name) === UserRole::SuperAdmin->value) {
                    continue;
                }

                $role->syncPermissions($permissionIds);
            }
        });

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        return redirect()->route('roles.index')->with('success', 'Role permissions updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);
        if (strtolower($role->name) === UserRole::SuperAdmin->value) {
            return redirect()->back()->with('error', 'Cannot delete Superadmin role.');
        }

        if ($role->users()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete role because users are currently assigned to it. Please reassign those users first.');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
