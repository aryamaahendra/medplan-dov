<?php

namespace App\Models;

use Database\Factories\PlanningRevisionGroupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanningRevisionGroup extends Model
{
    /** @use HasFactory<PlanningRevisionGroupFactory> */
    use HasFactory;

    protected $fillable = [
        'planning_version_id',
        'code',
        'name',
        'description',
        'parent_group_id',
    ];

    public function planningVersion(): BelongsTo
    {
        return $this->belongsTo(PlanningVersion::class);
    }

    public function parentGroup(): BelongsTo
    {
        return $this->belongsTo(PlanningRevisionGroup::class, 'parent_group_id');
    }

    public function childGroups(): HasMany
    {
        return $this->hasMany(PlanningRevisionGroup::class, 'parent_group_id');
    }

    public function activityVersions(): HasMany
    {
        return $this->hasMany(PlanningActivityVersion::class, 'revision_group_id');
    }
}
