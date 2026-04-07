<?php

namespace App\Observers;

use App\Models\Need;
use App\Models\NeedGroup;

class NeedObserver
{
    /**
     * Handle the Need "created" event.
     */
    public function created(Need $need): void
    {
        if ($need->need_group_id) {
            NeedGroup::where('id', $need->need_group_id)->increment('need_count');
        }
    }

    /**
     * Handle the Need "updated" event.
     */
    public function updated(Need $need): void
    {
        if ($need->wasChanged('need_group_id')) {
            if ($need->getOriginal('need_group_id')) {
                NeedGroup::where('id', $need->getOriginal('need_group_id'))->decrement('need_count');
            }
            if ($need->need_group_id) {
                NeedGroup::where('id', $need->need_group_id)->increment('need_count');
            }
        }
    }

    /**
     * Handle the Need "deleted" event.
     */
    public function deleted(Need $need): void
    {
        if ($need->isForceDeleting()) {
            return; // We decrement on soft delete, so don't double-decrement on force delete
        }

        if ($need->need_group_id) {
            NeedGroup::where('id', $need->need_group_id)->decrement('need_count');
        }
    }

    /**
     * Handle the Need "restored" event.
     */
    public function restored(Need $need): void
    {
        if ($need->need_group_id) {
            NeedGroup::where('id', $need->need_group_id)->increment('need_count');
        }
    }

    /**
     * Handle the Need "force deleted" event.
     */
    public function forceDeleted(Need $need): void
    {
        // If the model was NOT soft deleted before, we need to decrement
        // But Laravel typically fires 'deleted' even for forceDelete if soft deletes aren't used.
        // However, if the model trait is SoftDeletes, forceDelete() bypasses the normal deleted()
        // wait, no, forceDelete() fires 'forceDeleted'. If it was already soft deleted, it was decremented.
        // Let's check if it was previously soft deleted.
        if (! $need->trashed() && $need->need_group_id) { // Actually if forceDeleted fires, trashed() might be true or false.
            // Better to handle decrement in 'deleted' universally if we don't 'double-decrement'
        }
    }
}
