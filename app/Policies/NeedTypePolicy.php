<?php

namespace App\Policies;

use App\Models\NeedType;
use App\Models\User;

class NeedTypePolicy
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
        return $user->hasPermissionTo('view any need-types');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, NeedType $needType): bool
    {
        return $user->hasPermissionTo('view any need-types');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create need-types');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, NeedType $needType): bool
    {
        return $user->hasPermissionTo('update need-types');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, NeedType $needType): bool
    {
        return $user->hasPermissionTo('delete need-types');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, NeedType $needType): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, NeedType $needType): bool
    {
        return false;
    }
}
