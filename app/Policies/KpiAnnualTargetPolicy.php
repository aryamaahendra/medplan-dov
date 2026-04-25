<?php

namespace App\Policies;

use App\Models\KpiAnnualTarget;
use App\Models\User;

class KpiAnnualTargetPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any kpi-targets');
    }

    public function view(User $user, KpiAnnualTarget $kpiAnnualTarget): bool
    {
        return $user->hasPermissionTo('view any kpi-targets');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create kpi-targets');
    }

    public function update(User $user, KpiAnnualTarget $kpiAnnualTarget): bool
    {
        return $user->hasPermissionTo('update kpi-targets');
    }

    public function delete(User $user, KpiAnnualTarget $kpiAnnualTarget): bool
    {
        return $user->hasPermissionTo('delete kpi-targets');
    }
}
