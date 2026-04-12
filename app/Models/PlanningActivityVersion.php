<?php

namespace App\Models;

use App\Enums\PlanningActivityType;
use Database\Factories\PlanningActivityVersionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PlanningActivityVersion extends Model
{
    /** @use HasFactory<PlanningActivityVersionFactory> */
    use HasFactory;

    protected $fillable = [
        'planning_version_id',
        'parent_id',
        'code',
        'type',
        'name',
        'full_code',
        'perangkat_daerah',
        'keterangan',
        'sort_order',
    ];

    protected $casts = [
        'type' => PlanningActivityType::class,
    ];

    public function planningVersion(): BelongsTo
    {
        return $this->belongsTo(PlanningVersion::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(PlanningActivityVersion::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(PlanningActivityVersion::class, 'parent_id');
    }

    public function indicators(): HasMany
    {
        return $this->hasMany(PlanningActivityIndicator::class);
    }

    public function activityYears(): MorphMany
    {
        return $this->morphMany(PlanningActivityYear::class, 'yearable');
    }
}
