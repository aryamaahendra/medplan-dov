<?php

namespace App\Policies;

use App\Models\Indicator;
use App\Models\User;

class IndicatorPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any indicators');
    }

    public function view(User $user, Indicator $indicator): bool
    {
        return $user->hasPermissionTo('view any indicators');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create indicators');
    }

    public function update(User $user, Indicator $indicator): bool
    {
        return $user->hasPermissionTo('update indicators');
    }

    public function delete(User $user, Indicator $indicator): bool
    {
        return $user->hasPermissionTo('delete indicators');
    }
}
