<?php

namespace App\Models;

use Database\Factories\NeedGroupFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'description',
    'year',
    'is_active',
    'submission_start_at',
    'submission_end_at',
    'need_count',
])]
class NeedGroup extends Model
{
    /** @use HasFactory<NeedGroupFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'is_active' => 'boolean',
            'submission_start_at' => 'datetime',
            'submission_end_at' => 'datetime',
            'need_count' => 'integer',
        ];
    }

    /**
     * Determine whether the need group is currently open for submission.
     */
    public function isOpenForSubmission(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $now = now();

        if ($this->submission_start_at !== null && $now->lt($this->submission_start_at)) {
            return false;
        }

        if ($this->submission_end_at !== null && $now->gt($this->submission_end_at)) {
            return false;
        }

        return true;
    }

    /**
     * Get the needs for this group.
     */
    /**
     * Get the needs for this group.
     */
    public function needs(): HasMany
    {
        return $this->hasMany(Need::class);
    }

    public function checklistQuestions(): BelongsToMany
    {
        return $this->belongsToMany(ChecklistQuestion::class, 'need_group_checklist_question')
            ->withPivot(['order_column', 'is_required', 'is_active'])
            ->withTimestamps();
    }
}
