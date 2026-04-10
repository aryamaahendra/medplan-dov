<?php

namespace App\Models;

use Database\Factories\PlanningActivityYearFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanningActivityYear extends Model
{
    /** @use HasFactory<PlanningActivityYearFactory> */
    use HasFactory;

    protected $fillable = [
        'planning_activity_version_id',
        'year',
        'target',
        'budget',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'budget' => 'decimal:2',
        ];
    }

    public function activityVersion(): BelongsTo
    {
        return $this->belongsTo(PlanningActivityVersion::class, 'planning_activity_version_id');
    }
}
