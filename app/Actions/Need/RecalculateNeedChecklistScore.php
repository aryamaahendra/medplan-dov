<?php

namespace App\Actions\Need;

use App\Enums\ChecklistAnswer;
use App\Models\Need;

class RecalculateNeedChecklistScore
{
    /**
     * Recalculate the checklist percentage for a given need.
     */
    public function execute(Need $need): void
    {
        $answers = $need->checklistAnswers()
            ->whereIn('answer', [ChecklistAnswer::Yes, ChecklistAnswer::No])
            ->get();

        $yesCount = $answers->where('answer', ChecklistAnswer::Yes)->count();
        $totalRelevant = $answers->count();

        $percentage = $totalRelevant > 0
            ? ($yesCount / $totalRelevant) * 100
            : 0;

        $need->updateQuietly([
            'checklist_percentage' => round($percentage, 2),
        ]);
    }
}
