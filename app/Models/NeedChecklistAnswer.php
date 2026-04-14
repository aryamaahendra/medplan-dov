<?php

namespace App\Models;

use App\Enums\ChecklistAnswer;
use App\Observers\NeedChecklistAnswerObserver;
use Database\Factories\NeedChecklistAnswerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'need_id',
    'checklist_question_id',
    'answer',
    'notes',
])]
#[ObservedBy(NeedChecklistAnswerObserver::class)]
class NeedChecklistAnswer extends Model
{
    /** @use HasFactory<NeedChecklistAnswerFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'answer' => ChecklistAnswer::class,
        ];
    }

    /**
     * Get the need this answer belongs to.
     */
    public function need(): BelongsTo
    {
        return $this->belongsTo(Need::class);
    }

    /**
     * Get the checklist question this answer is for.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(ChecklistQuestion::class, 'checklist_question_id');
    }
}
