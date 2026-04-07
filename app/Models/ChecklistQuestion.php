<?php

namespace App\Models;

use Database\Factories\ChecklistQuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'question',
    'description',
    'is_active',
    'order_column',
])]
class ChecklistQuestion extends Model
{
    /** @use HasFactory<ChecklistQuestionFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'order_column' => 'integer',
        ];
    }

    /**
     * Get the need groups that use this question.
     */
    public function needGroups(): BelongsToMany
    {
        return $this->belongsToMany(NeedGroup::class, 'need_group_checklist_question')
            ->withPivot(['order_column', 'is_required', 'is_active'])
            ->withTimestamps();
    }
}
