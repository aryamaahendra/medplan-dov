<?php

namespace App\Policies;

use App\Models\NeedGroup;
use App\Models\User;

class NeedGroupPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any need-groups');
    }

    public function view(User $user, NeedGroup $needGroup): bool
    {
        return $user->hasPermissionTo('view any need-groups');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create need-groups');
    }

    public function update(User $user, NeedGroup $needGroup): bool
    {
        return $user->hasPermissionTo('update need-groups');
    }

    public function delete(User $user, NeedGroup $needGroup): bool
    {
        return $user->hasPermissionTo('delete need-groups');
    }
}
