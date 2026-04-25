<?php

namespace App\Policies;

use App\Models\PlanningActivityVersion;
use App\Models\User;

class PlanningActivityVersionPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any planning-activity-versions');
    }

    public function view(User $user, PlanningActivityVersion $planningActivityVersion): bool
    {
        return $user->hasPermissionTo('view any planning-activity-versions');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create planning-activity-versions');
    }

    public function update(User $user, PlanningActivityVersion $planningActivityVersion): bool
    {
        return $user->hasPermissionTo('update planning-activity-versions');
    }

    public function delete(User $user, PlanningActivityVersion $planningActivityVersion): bool
    {
        return $user->hasPermissionTo('delete planning-activity-versions');
    }
}
