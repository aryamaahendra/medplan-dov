<?php

namespace App\Http\Controllers;

use App\Enums\ChecklistAnswer;
use App\Http\Resources\NeedChecklistAnswerResource;
use App\Models\Need;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;

class NeedChecklistAnswerController extends Controller
{
    /**
     * Store multiple answers for a need.
     */
    public function store(Request $request, Need $need): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*.checklist_question_id' => ['required', 'exists:checklist_questions,id'],
            'answers.*.answer' => ['required', new Enum(ChecklistAnswer::class)],
            'answers.*.notes' => ['nullable', 'string'],
        ]);

        $answers = collect($validated['answers'])->map(function ($answerData) use ($need) {
            return $need->checklistAnswers()->updateOrCreate(
                ['checklist_question_id' => $answerData['checklist_question_id']],
                [
                    'answer' => $answerData['answer'],
                    'notes' => $answerData['notes'] ?? null,
                ]
            );
        });

        return NeedChecklistAnswerResource::collection($answers);
    }
}
