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
        return $user->hasPermissionTo('manage kpis');
    }

    public function view(User $user, KpiGroup $kpiGroup): bool
    {
        return $user->hasPermissionTo('manage kpis');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage kpis');
    }

    public function update(User $user, KpiGroup $kpiGroup): bool
    {
        return $user->hasPermissionTo('manage kpis');
    }

    public function delete(User $user, KpiGroup $kpiGroup): bool
    {
        return $user->hasPermissionTo('manage kpis');
    }
}
