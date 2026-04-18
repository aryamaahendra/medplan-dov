<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        $this->authorizeResource(Permission::class, 'permission');
    }

    /** Columns users can search across */
    private const array SEARCH_COLUMNS = ['name'];

    /** Columns users can sort by */
    private const array SORTABLE_COLUMNS = ['name', 'created_at'];

    public function index(Request $request): Response
    {
        $permissions = $this->applyDataTable(
            Permission::query(),
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
        );

        return Inertia::render('management/permissions/index', [
            'permissions' => $permissions,
            'filters' => $this->dataTableFilters($request),
        ]);
    }
}
