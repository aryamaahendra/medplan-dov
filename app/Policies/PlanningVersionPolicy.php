<?php

namespace App\Policies;

use App\Models\PlanningVersion;
use App\Models\User;

class PlanningVersionPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any planning-versions');
    }

    public function view(User $user, PlanningVersion $planningVersion): bool
    {
        return $user->hasPermissionTo('view any planning-versions');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create planning-versions');
    }

    public function update(User $user, PlanningVersion $planningVersion): bool
    {
        return $user->hasPermissionTo('update planning-versions');
    }

    public function delete(User $user, PlanningVersion $planningVersion): bool
    {
        return $user->hasPermissionTo('delete planning-versions');
    }
}
