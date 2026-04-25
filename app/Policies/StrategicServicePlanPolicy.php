<?php

namespace App\Policies;

use App\Models\StrategicServicePlan;
use App\Models\User;

class StrategicServicePlanPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any ssps');
    }

    public function view(User $user, StrategicServicePlan $strategicServicePlan): bool
    {
        return $user->hasPermissionTo('view any ssps');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create ssps');
    }

    public function update(User $user, StrategicServicePlan $strategicServicePlan): bool
    {
        return $user->hasPermissionTo('update ssps');
    }

    public function delete(User $user, StrategicServicePlan $strategicServicePlan): bool
    {
        return $user->hasPermissionTo('delete ssps');
    }
}
