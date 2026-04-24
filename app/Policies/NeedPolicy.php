<?php

namespace App\Policies;

use App\Models\Need;
use App\Models\OrganizationalUnit;
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
        return $user->hasPermissionTo('view any needs')
            || $user->hasPermissionTo('view descendant needs')
            || $user->hasPermissionTo('view needs');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Need $need): bool
    {
        return $this->checkTieredPermission($user, $need, 'view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create any needs')
            || $user->hasPermissionTo('create descendant needs')
            || $user->hasPermissionTo('create needs');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Need $need): bool
    {
        return $this->checkTieredPermission($user, $need, 'update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Need $need): bool
    {
        return $this->checkTieredPermission($user, $need, 'delete');
    }

    /**
     * Determine whether the user can approve the model.
     */
    public function approve(User $user, Need $need): bool
    {
        return $this->checkTieredPermission($user, $need, 'approve');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Need $need): bool
    {
        return $this->checkTieredPermission($user, $need, 'restore');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Need $need): bool
    {
        return $this->checkTieredPermission($user, $need, 'force-delete');
    }

    /**
     * Helper to check tiered permissions.
     */
    private function checkTieredPermission(User $user, Need $need, string $action): bool
    {
        if ($user->hasPermissionTo("{$action} any needs")) {
            return true;
        }

        if ($user->hasPermissionTo("{$action} descendant needs")) {
            if ($user->organizational_unit_id === $need->organizational_unit_id) {
                return true;
            }

            if ($need->organizational_unit_id !== null && $user->organizational_unit_id !== null) {
                $needUnit = $need->organizationalUnit ?? OrganizationalUnit::find($need->organizational_unit_id);
                if ($needUnit && $needUnit->isDescendantOf($user->organizational_unit_id)) {
                    return true;
                }
            }
        }

        return $user->hasPermissionTo("{$action} needs")
            && $user->organizational_unit_id === $need->organizational_unit_id;
    }
}
