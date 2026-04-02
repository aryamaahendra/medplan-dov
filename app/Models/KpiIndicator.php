<?php

namespace App\Models;

use Database\Factories\KpiIndicatorFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiIndicator extends Model
{
    /** @use HasFactory<KpiIndicatorFactory> */
    use HasFactory;

    protected $fillable = [
        'group_id',
        'parent_indicator_id',
        'name',
        'unit',
        'is_category',
        'baseline_value',
    ];

    protected $casts = [
        'is_category' => 'boolean',
    ];

    public function group()
    {
        return $this->belongsTo(KpiGroup::class, 'group_id');
    }

    public function parentIndicator()
    {
        return $this->belongsTo(KpiIndicator::class, 'parent_indicator_id');
    }

    public function childIndicators()
    {
        return $this->hasMany(KpiIndicator::class, 'parent_indicator_id');
    }

    public function annualTargets()
    {
        return $this->hasMany(KpiAnnualTarget::class, 'indicator_id');
    }
}
