<?php

namespace App\Models;

use Database\Factories\StrategicServicePlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StrategicServicePlan extends Model
{
    /** @use HasFactory<StrategicServicePlanFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'year',
        'strategic_program',
        'service_plan',
        'target',
        'policy_direction',
    ];
}
