<?php

namespace App\Policies;

use App\Models\KpiGroup;
use App\Models\User;

class KpiGroupPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any kpi-groups');
    }

    public function view(User $user, KpiGroup $kpiGroup): bool
    {
        return $user->hasPermissionTo('view any kpi-groups');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create kpi-groups');
    }

    public function update(User $user, KpiGroup $kpiGroup): bool
    {
        return $user->hasPermissionTo('update kpi-groups');
    }

    public function delete(User $user, KpiGroup $kpiGroup): bool
    {
        return $user->hasPermissionTo('delete kpi-groups');
    }
}
