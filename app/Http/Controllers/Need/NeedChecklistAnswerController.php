<?php

declare(strict_types=1);

namespace App\Http\Controllers\Need;

use App\Actions\Need\ChecklistAssessmentEngine;
use App\Http\Controllers\Controller;
use App\Http\Requests\Need\StoreNeedChecklistAnswerRequest;
use App\Models\Need;
use Illuminate\Http\RedirectResponse;

final class NeedChecklistAnswerController extends Controller
{
    /**
     * Store multiple answers for a need.
     */
    public function store(
        StoreNeedChecklistAnswerRequest $request,
        Need $need,
        ChecklistAssessmentEngine $assessmentEngine
    ): RedirectResponse {
        $this->authorize('performChecklist', $need);

        $assessmentEngine->evaluate($need, $request->validated()['answers']);

        return back()->with('success', 'Checklist berhasil disimpan.');
    }
}
