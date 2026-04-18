<?php

namespace App\Policies;

use App\Models\OrganizationalUnit;
use App\Models\User;

class OrganizationalUnitPolicy
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
        return $user->hasPermissionTo('view any org-units');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, OrganizationalUnit $organizationalUnit): bool
    {
        return $user->hasPermissionTo('view any org-units');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create org-units');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OrganizationalUnit $organizationalUnit): bool
    {
        return $user->hasPermissionTo('update org-units');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OrganizationalUnit $organizationalUnit): bool
    {
        return $user->hasPermissionTo('delete org-units');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, OrganizationalUnit $organizationalUnit): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, OrganizationalUnit $organizationalUnit): bool
    {
        return false;
    }
}
