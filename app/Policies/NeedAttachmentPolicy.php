<?php

namespace App\Policies;

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

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create need-attachments');
    }

    public function update(User $user, NeedAttachment $needAttachment): bool
    {
        return $user->hasPermissionTo('create need-attachments')
            && $user->can('update', $needAttachment->need);
    }

    public function delete(User $user, NeedAttachment $needAttachment): bool
    {
        return $user->hasPermissionTo('delete need-attachments')
            && $user->can('update', $needAttachment->need);
    }
}
