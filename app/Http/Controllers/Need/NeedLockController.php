<?php

declare(strict_types=1);

namespace App\Http\Controllers\Need;

use App\Actions\Need\NeedLockLifecycle;
use App\Http\Controllers\Controller;
use App\Http\Requests\Need\LockNeedRequest;
use App\Http\Requests\Need\UnlockNeedRequest;
use App\Models\Need;
use Illuminate\Http\RedirectResponse;

final class NeedLockController extends Controller
{
    /**
     * Lock the given need.
     */
    public function lock(LockNeedRequest $request, Need $need, NeedLockLifecycle $lifecycle): RedirectResponse
    {
        $this->authorize('lock', $need);

        $lifecycle->lock(
            $need,
            $request->validated('lock_reason'),
            $request->user()
        );

        return back()->with('success', 'Usulan kebutuhan berhasil dikunci.');
    }

    /**
     * Unlock the given need or grant a temporary extension.
     */
    public function unlock(UnlockNeedRequest $request, Need $need, NeedLockLifecycle $lifecycle): RedirectResponse
    {
        $this->authorize('unlock', $need);

        $lifecycle->unlock(
            $need,
            $request->validated('lock_reason'),
            $request->user(),
            $request->validated('unlocked_until'),
            (bool) $request->boolean('inherit_schedule')
        );

        $message = $request->boolean('inherit_schedule')
            ? 'Override kunci berhasil dicabut dan jadwal kelompok dipulihkan.'
            : 'Kunci usulan kebutuhan berhasil dibuka.';

        return back()->with('success', $message);
    }
}
