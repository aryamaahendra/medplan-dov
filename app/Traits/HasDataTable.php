<?php

namespace App\Traits;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait HasDataTable
{
    /**
     * Apply search, sort, and pagination to a query from request params.
     *
     * @param  array<string>  $searchColumns  Columns to search across
     * @param  array<string>  $sortableColumns  Columns allowed for sorting
     */
    protected function applyDataTable(
        Builder $query,
        Request $request,
        array $searchColumns = [],
        array $sortableColumns = [],
        int $defaultPerPage = 15,
    ): LengthAwarePaginator {
        $this->applySearch($query, $request, $searchColumns);
        $this->applySort($query, $request, $sortableColumns);

        $perPage = $this->resolvePerPage($request, $defaultPerPage);

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Apply full-text search across the given columns.
     *
     * @param  array<string>  $columns
     */
    private function applySearch(Builder $query, Request $request, array $columns): void
    {
        $search = $request->string('search')->trim()->value();

        if ($search === '' || empty($columns)) {
            return;
        }

        $query->where(function (Builder $q) use ($search, $columns): void {
            foreach ($columns as $column) {
                $q->orWhere($column, 'like', "%{$search}%");
            }
        });
    }

    /**
     * Apply sorting based on `sort` and `direction` query params.
     *
     * @param  array<string>  $allowed  Whitelist of sortable columns
     */
    private function applySort(Builder $query, Request $request, array $allowed): void
    {
        $sort = $request->string('sort')->value();
        $direction = $request->string('direction')->lower()->value();

        if ($sort === '' || ! in_array($sort, $allowed, true)) {
            return;
        }

        $direction = in_array($direction, ['asc', 'desc'], true) ? $direction : 'asc';

        $query->orderBy($sort, $direction);
    }

    /**
     * Resolve a safe per_page value from the request.
     */
    private function resolvePerPage(Request $request, int $default): int
    {
        $perPage = $request->integer('per_page', $default);

        return max(1, min($perPage, 100));
    }

    /**
     * Build the filters array to pass back to Inertia.
     *
     * @return array{search: string, sort: string, direction: string, per_page: int}
     */
    protected function dataTableFilters(Request $request, int $defaultPerPage = 15): array
    {
        return [
            'search' => $request->string('search')->trim()->value(),
            'sort' => $request->string('sort')->value(),
            'direction' => $request->string('direction')->value(),
            'per_page' => $this->resolvePerPage($request, $defaultPerPage),
        ];
    }
}
