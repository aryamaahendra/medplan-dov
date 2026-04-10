<?php

namespace App\Models;

use Database\Factories\PlanningActivityVersionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanningActivityVersion extends Model
{
    /** @use HasFactory<PlanningActivityVersionFactory> */
    use HasFactory;

    protected $fillable = [
        'planning_version_id',
        'revision_group_id',
        'parent_id',
        'code',
        'name',
        'type',
        'full_code',
        'indicator_name',
        'indicator_baseline_2024',
        'perangkat_daerah',
        'keterangan',
        'sort_order',
    ];

    public function planningVersion(): BelongsTo
    {
        return $this->belongsTo(PlanningVersion::class);
    }

    public function revisionGroup(): BelongsTo
    {
        return $this->belongsTo(PlanningRevisionGroup::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(PlanningActivityVersion::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(PlanningActivityVersion::class, 'parent_id');
    }

    public function activityYears(): HasMany
    {
        return $this->hasMany(PlanningActivityYear::class);
    }
}
