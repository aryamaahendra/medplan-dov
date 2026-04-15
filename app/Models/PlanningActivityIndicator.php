<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PlanningActivityIndicator extends Model
{
    use HasFactory;

    protected $fillable = [
        'planning_activity_version_id',
        'name',
        'baseline',
        'unit',
    ];

    public function activityVersion(): BelongsTo
    {
        return $this->belongsTo(PlanningActivityVersion::class, 'planning_activity_version_id');
    }

    public function activityYears(): MorphMany
    {
        return $this->morphMany(PlanningActivityYear::class, 'yearable');
    }

    public function needs(): BelongsToMany
    {
        return $this->belongsToMany(Need::class, 'need_planning_activity_indicator', 'planning_activity_indicator_id', 'need_id');
    }
}
