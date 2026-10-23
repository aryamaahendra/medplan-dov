<?php

declare(strict_types=1);

namespace App\Actions\Need\Dashboard;

use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class DashboardScopeResolver
{
    /**
     * Resolve unique scope key for caching.
     */
    public function resolveScopeKey(?User $user): string
    {
        if (! $user) {
            return 'anon';
        }

        if ($user->can('view any needs')) {
            return 'all';
        }

        if ($user->can('view descendant needs') && $user->organizational_unit_id) {
            return "desc_{$user->organizational_unit_id}";
        }

        return "unit_{$user->organizational_unit_id}";
    }

    /**
     * Apply user role and organizational unit scope to an Eloquent query.
     */
    public function applyScope(Builder $query, ?User $user): Builder
    {
        if (! $user) {
            return $query;
        }

        if (! $user->can('view any needs')) {
            if ($user->can('view descendant needs') && $user->organizational_unit_id) {
                $unit = $user->organizationalUnit;
                if ($unit) {
                    $unit->loadMissing('descendantsRecursive');
                    $allowedIds = $this->extractUnitIds($unit);
                    $query->whereIn('organizational_unit_id', $allowedIds);
                } else {
                    $query->where('organizational_unit_id', $user->organizational_unit_id);
                }
            } else {
                $query->where('organizational_unit_id', $user->organizational_unit_id);
            }
        }

        return $query;
    }

    /**
     * Recursively extract all unit IDs for a given organizational unit and its descendants.
     *
     * @return array<int>
     */
    public function extractUnitIds(OrganizationalUnit $unit): array
    {
        $ids = [$unit->id];
        foreach ($unit->descendantsRecursive as $child) {
            $ids = array_merge($ids, $this->extractUnitIds($child));
        }

        return $ids;
    }

    /**
     * Raw stage CASE SQL string for Postgres & SQLite.
     * Derived Stage:
     * - 'rejected': status = 'rejected'
     * - 'approved': approved_by_director_at IS NOT NULL
     * - 'under_review': status = 'submitted' OR (status = 'approved' AND approved_by_director_at IS NULL)
     * - 'draft': everything else
     */
    public function stageCaseSql(): string
    {
        return "CASE
            WHEN status = 'rejected' THEN 'rejected'
            WHEN approved_by_director_at IS NOT NULL THEN 'approved'
            WHEN status = 'submitted' OR (status = 'approved' AND approved_by_director_at IS NULL) THEN 'under_review'
            ELSE 'draft'
        END";
    }
}
