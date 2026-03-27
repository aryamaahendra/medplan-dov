<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use HasDataTable;

    /** Columns users can search across */
    private const array SEARCH_COLUMNS = ['name', 'email'];

    /** Columns users can sort by */
    private const array SORTABLE_COLUMNS = ['name', 'email', 'created_at'];

    public function index(Request $request): Response
    {
        $users = $this->applyDataTable(
            User::query(),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => $this->dataTableFilters($request),
        ]);
    }
}
