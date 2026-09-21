<?php

namespace App\Policies;

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class NeedPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view any needs')
            || $user->hasPermissionTo('view descendant needs')
            || $user->hasPermissionTo('view needs');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Need $need): bool
    {
        return $this->checkTieredPermission($user, $need, 'view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, ?NeedGroup $needGroup = null): Response|bool
    {
        $hasPermission = $user->hasPermissionTo('create any needs')
            || $user->hasPermissionTo('create descendant needs')
            || $user->hasPermissionTo('create needs');

        if (! $hasPermission) {
            return false;
        }

        if (! $needGroup) {
            $groupId = request()->input('need_group_id');
            if ($groupId) {
                $needGroup = NeedGroup::find($groupId);
            }
        }

        if ($needGroup && ! $this->canBypassSubmissionWindow($user)) {
            if (! $needGroup->isOpenForSubmission()) {
                return Response::deny('Periode pengajuan usulan kebutuhan untuk kelompok ini sedang ditutup.');
            }
        }

        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Need $need): Response|bool
    {
        if (! $this->checkTieredPermission($user, $need, 'update')) {
            return false;
        }

        if (! $this->canBypassSubmissionWindow($user)) {
            $needGroup = $need->needGroup ?? NeedGroup::find($need->need_group_id);
            if ($needGroup && ! $needGroup->isOpenForSubmission()) {
                return Response::deny('Periode pengajuan usulan kebutuhan untuk kelompok ini sedang ditutup.');
            }

            if ($need->isLocked($user)) {
                return Response::deny('Usulan kebutuhan terkunci dan tidak dapat diubah.');
            }
        }

        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Need $need): Response|bool
    {
        if (! $this->checkTieredPermission($user, $need, 'delete')) {
            return false;
        }

        if (! $this->canBypassSubmissionWindow($user)) {
            if ($need->isLocked($user)) {
                return Response::deny('Usulan kebutuhan terkunci dan tidak dapat dihapus.');
            }
        }

        return true;
    }

    /**
     * Determine whether the user can approve the model.
     */
    public function approve(User $user, Need $need): bool
    {
        return $this->checkTieredPermission($user, $need, 'approve');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Need $need): Response|bool
    {
        if (! $this->checkTieredPermission($user, $need, 'restore')) {
            return false;
        }

        if (! $this->canBypassSubmissionWindow($user)) {
            if ($need->isLocked($user)) {
                return Response::deny('Usulan kebutuhan terkunci dan tidak dapat dipulihkan.');
            }
        }

        return true;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Need $need): Response|bool
    {
        if (! $this->checkTieredPermission($user, $need, 'force-delete')) {
            return false;
        }

        if (! $this->canBypassSubmissionWindow($user)) {
            if ($need->isLocked($user)) {
                return Response::deny('Usulan kebutuhan terkunci dan tidak dapat dihapus permanen.');
            }
        }

        return true;
    }

    /**
     * Determine whether the user can perform checklist evaluations on the model.
     */
    public function performChecklist(User $user, Need $need): bool
    {
        return $user->hasPermissionTo('perform checklist');
    }

    /**
     * Helper to check tiered permissions.
     */
    private function checkTieredPermission(User $user, Need $need, string $action): bool
    {
        if ($user->hasPermissionTo("{$action} any needs")) {
            return true;
        }

        if ($user->hasPermissionTo("{$action} descendant needs")) {
            if ($user->organizational_unit_id === $need->organizational_unit_id) {
                return true;
            }

            if ($need->organizational_unit_id !== null && $user->organizational_unit_id !== null) {
                $needUnit = $need->organizationalUnit ?? OrganizationalUnit::find($need->organizational_unit_id);
                if ($needUnit && $needUnit->isDescendantOf($user->organizational_unit_id)) {
                    return true;
                }
            }
        }

        return $user->hasPermissionTo("{$action} needs")
            && $user->organizational_unit_id === $need->organizational_unit_id;
    }

    /**
     * Determine whether the user can bypass the submission window restrictions.
     */
    private function canBypassSubmissionWindow(User $user): bool
    {
        return $user->hasRole('super-admin') || $user->hasRole('planner');
    }
}
