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
        return $user->hasPermissionTo('view any checklist-questions');
    }

    public function view(User $user, ChecklistQuestion $checklistQuestion): bool
    {
        return $user->hasPermissionTo('view any checklist-questions');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create checklist-questions');
    }

    public function update(User $user, ChecklistQuestion $checklistQuestion): bool
    {
        return $user->hasPermissionTo('update checklist-questions');
    }

    public function delete(User $user, ChecklistQuestion $checklistQuestion): bool
    {
        return $user->hasPermissionTo('delete checklist-questions');
    }
}
