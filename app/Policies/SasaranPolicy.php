<?php

namespace App\Policies;

use App\Models\Sasaran;
use App\Models\User;

class SasaranPolicy
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
        return $user->hasPermissionTo('view any sasarans');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Sasaran $sasaran): bool
    {
        return $user->hasPermissionTo('view any sasarans');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create sasarans');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Sasaran $sasaran): bool
    {
        return $user->hasPermissionTo('update sasarans');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Sasaran $sasaran): bool
    {
        return $user->hasPermissionTo('delete sasarans');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Sasaran $sasaran): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Sasaran $sasaran): bool
    {
        return false;
    }
}
