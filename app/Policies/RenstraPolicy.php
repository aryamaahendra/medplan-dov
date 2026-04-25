<?php

namespace App\Policies;

use App\Models\Renstra;
use App\Models\User;

class RenstraPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any renstras');
    }

    public function view(User $user, Renstra $renstra): bool
    {
        return $user->hasPermissionTo('view any renstras');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create renstras');
    }

    public function update(User $user, Renstra $renstra): bool
    {
        return $user->hasPermissionTo('update renstras');
    }

    public function delete(User $user, Renstra $renstra): bool
    {
        return $user->hasPermissionTo('delete renstras');
    }
}
