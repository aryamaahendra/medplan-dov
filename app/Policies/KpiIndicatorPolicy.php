<?php

namespace App\Policies;

use App\Models\KpiIndicator;
use App\Models\User;

class KpiIndicatorPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any kpi-indicators');
    }

    public function view(User $user, KpiIndicator $kpiIndicator): bool
    {
        return $user->hasPermissionTo('view any kpi-indicators');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create kpi-indicators');
    }

    public function update(User $user, KpiIndicator $kpiIndicator): bool
    {
        return $user->hasPermissionTo('update kpi-indicators');
    }

    public function delete(User $user, KpiIndicator $kpiIndicator): bool
    {
        return $user->hasPermissionTo('delete kpi-indicators');
    }
}
