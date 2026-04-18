<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Http\Requests\Management\StoreUserRequest;
use App\Http\Requests\Management\UpdateUserRequest;
use App\Models\User;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        //
    }

    /** Columns users can search across */
    private const array SEARCH_COLUMNS = ['name', 'nip', 'email'];

    /** Columns users can sort by */
    private const array SORTABLE_COLUMNS = ['name', 'nip', 'email', 'created_at'];

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);
        $users = $this->applyDataTable(
            User::with('roles'),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        $roles = Role::all();

        return Inertia::render('management/users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $this->dataTableFilters($request),
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $this->authorize('create', User::class);
        $user = User::create($request->validated());

        if ($request->has('roles')) {
            $user->syncRoles($request->validated('roles'));
        }

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);
        $data = $request->validated();
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        if ($request->has('roles')) {
            $user->syncRoles($request->validated('roles'));
        }

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}
