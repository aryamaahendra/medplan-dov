<?php

namespace App\Models;

use Database\Factories\PlanningActivityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanningActivity extends Model
{
    /** @use HasFactory<PlanningActivityFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'parent_id',
        'type',
        'full_code',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(PlanningActivity::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(PlanningActivity::class, 'parent_id');
    }

    protected function casts(): array
    {
        return [
        ];
    }
}
