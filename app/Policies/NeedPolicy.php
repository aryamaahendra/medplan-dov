<?php

namespace App\Policies;

use App\Models\Need;
use App\Models\User;

class NeedPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any needs');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Need $need): bool
    {
        if ($user->hasPermissionTo('view any needs') && $user->hasAnyRole(['admin', 'planner'])) {
            return true;
        }

        return $user->hasPermissionTo('view needs') && $user->organizational_unit_id === $need->organizational_unit_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create needs');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Need $need): bool
    {
        if ($user->hasPermissionTo('update needs') && $user->hasAnyRole(['admin', 'planner'])) {
            return true;
        }

        return $user->hasPermissionTo('update needs') && $user->organizational_unit_id === $need->organizational_unit_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Need $need): bool
    {
        if ($user->hasPermissionTo('delete needs') && $user->hasAnyRole(['admin', 'planner'])) {
            return true;
        }

        return $user->hasPermissionTo('delete needs') && $user->organizational_unit_id === $need->organizational_unit_id;
    }

    /**
     * Determine whether the user can approve the model.
     */
    public function approve(User $user, Need $need): bool
    {
        return $user->hasPermissionTo('approve needs');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Need $need): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Need $need): bool
    {
        return false;
    }
}
