<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Enums\ChecklistAnswer;
use App\Models\Need;
use App\Models\NeedChecklistAnswer;
use Illuminate\Support\Facades\DB;

class ChecklistAssessmentEngine
{
    /**
     * Submit and evaluate checklist answers for a need within a single atomic transaction.
     *
     * @param  array<int, array{checklist_question_id: int, answer: string|ChecklistAnswer, notes?: ?string}>  $answers
     */
    public function evaluate(Need $need, array $answers): float
    {
        return DB::transaction(function () use ($need, $answers) {
            foreach ($answers as $data) {
                $need->checklistAnswers()->updateOrCreate(
                    ['checklist_question_id' => $data['checklist_question_id']],
                    [
                        'answer' => $data['answer'],
                        'notes' => $data['notes'] ?? null,
                    ]
                );
            }

            return $this->recalculate($need);
        });
    }

    /**
     * Recalculate and update the checklist percentage for a need.
     */
    public function recalculate(Need $need): float
    {
        $answers = $need->checklistAnswers()
            ->whereIn('answer', [ChecklistAnswer::Yes, ChecklistAnswer::No])
            ->get();

        $yesCount = $answers->where('answer', ChecklistAnswer::Yes)->count();
        $totalRelevant = $answers->count();

        $percentage = $totalRelevant > 0
            ? round(($yesCount / $totalRelevant) * 100, 2)
            : 0.0;

        $need->updateQuietly([
            'checklist_percentage' => $percentage,
        ]);

        return $percentage;
    }

    /**
     * Delete an answer and recalculate the score atomically.
     */
    public function deleteAnswer(NeedChecklistAnswer $answer): float
    {
        return DB::transaction(function () use ($answer) {
            /** @var Need $need */
            $need = $answer->need;
            $answer->delete();

            return $this->recalculate($need);
        });
    }
}
