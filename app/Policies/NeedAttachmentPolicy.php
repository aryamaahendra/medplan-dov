<?php

namespace App\Policies;

use App\Models\Need;
use App\Models\NeedAttachment;
use App\Models\User;

class NeedAttachmentPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view need-attachments');
    }

    public function view(User $user, NeedAttachment $needAttachment): bool
    {
        return $user->hasPermissionTo('view need-attachments')
            && $user->can('view', $needAttachment->need);
    }

    public function create(User $user, ?Need $need = null): bool
    {
        if (! $user->hasPermissionTo('create need-attachments')) {
            return false;
        }

        if ($need) {
            // Planners and Super Admins can attach review notes and evaluation documentation to locked Needs
            if ($user->hasRole('planner') || $user->hasRole('super-admin')) {
                return $user->can('view', $need);
            }

            return $user->can('update', $need);
        }

        return true;
    }

    public function update(User $user, NeedAttachment $needAttachment): bool
    {
        if (! $user->hasPermissionTo('create need-attachments')) {
            return false;
        }

        if ($user->hasRole('planner') || $user->hasRole('super-admin')) {
            return $user->can('view', $needAttachment->need);
        }

        return $user->can('update', $needAttachment->need);
    }

    public function delete(User $user, NeedAttachment $needAttachment): bool
    {
        if (! $user->hasPermissionTo('delete need-attachments')) {
            return false;
        }

        if ($user->hasRole('planner') || $user->hasRole('super-admin')) {
            return $user->can('view', $needAttachment->need);
        }

        return $user->can('update', $needAttachment->need);
    }
}
