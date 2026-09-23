<?php

namespace App\Actions\Need;

use App\Models\Need;

class RecalculateNeedChecklistScore
{
    public function __construct(
        protected ChecklistAssessmentEngine $engine
    ) {}

    /**
     * Recalculate the checklist percentage for a given need.
     */
    public function execute(Need $need): void
    {
        $this->engine->recalculate($need);
    }
}
