<?php

declare(strict_types=1);

namespace App\Http\Controllers\Need;

use App\Actions\Need\RecalculateNeedChecklistScore;
use App\Http\Controllers\Controller;
use App\Http\Requests\Need\StoreNeedChecklistAnswerRequest;
use App\Models\Need;
use Illuminate\Http\RedirectResponse;

class NeedChecklistAnswerController extends Controller
{
    /**
     * Store multiple answers for a need.
     */
    public function store(StoreNeedChecklistAnswerRequest $request, Need $need, RecalculateNeedChecklistScore $recalculateScore): RedirectResponse
    {
        $this->authorize('performChecklist', $need);

        $validated = $request->validated();
        foreach ($validated['answers'] as $answerData) {
            $need->checklistAnswers()->updateOrCreate(
                ['checklist_question_id' => $answerData['checklist_question_id']],
                [
                    'answer' => $answerData['answer'],
                    'notes' => $answerData['notes'] ?? null,
                ]
            );
        }

        $recalculateScore->execute($need);

        return back()->with('success', 'Checklist berhasil disimpan.');
    }
}
