<?php

namespace App\Http\Controllers\Need;

use App\Enums\ChecklistAnswer;
use App\Http\Controllers\Controller;
use App\Models\Need;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class NeedChecklistAnswerController extends Controller
{
    /**
     * Store multiple answers for a need.
     */
    public function store(Request $request, Need $need): RedirectResponse
    {
        $validated = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*.checklist_question_id' => ['required', 'exists:checklist_questions,id'],
            'answers.*.answer' => ['required', new Enum(ChecklistAnswer::class)],
            'answers.*.notes' => ['nullable', 'string'],
        ]);

        foreach ($validated['answers'] as $answerData) {
            $need->checklistAnswers()->updateOrCreate(
                ['checklist_question_id' => $answerData['checklist_question_id']],
                [
                    'answer' => $answerData['answer'],
                    'notes' => $answerData['notes'] ?? null,
                ]
            );
        }

        return back()->with('success', 'Checklist berhasil disimpan.');
    }
}
