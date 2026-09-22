<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\StrategicServicePlanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'year',
    'strategic_program',
    'service_plan',
    'target',
    'policy_direction',
])]
class StrategicServicePlan extends Model
{
    /** @use HasFactory<StrategicServicePlanFactory> */
    use HasFactory, SoftDeletes;

    protected $casts = [
        'year' => 'integer',
    ];

    /**
     * Get the needs that link to this strategic service plan.
     */
    public function needs(): BelongsToMany
    {
        return $this->belongsToMany(Need::class, 'need_strategic_service_plan', 'strategic_service_plan_id', 'need_id');
    }
}
