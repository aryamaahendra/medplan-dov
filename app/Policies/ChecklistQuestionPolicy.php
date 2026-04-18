<?php

namespace App\Policies;

use App\Models\ChecklistQuestion;
use App\Models\User;

class ChecklistQuestionPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('manage need-checklists');
    }

    public function view(User $user, ChecklistQuestion $checklistQuestion): bool
    {
        return $user->hasPermissionTo('manage need-checklists');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage need-checklists');
    }

    public function update(User $user, ChecklistQuestion $checklistQuestion): bool
    {
        return $user->hasPermissionTo('manage need-checklists');
    }

    public function delete(User $user, ChecklistQuestion $checklistQuestion): bool
    {
        return $user->hasPermissionTo('manage need-checklists');
    }
}
