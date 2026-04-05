<?php

namespace App\Models;

use Database\Factories\KpiIndicatorFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function group(): BelongsTo
    {
        return $this->belongsTo(KpiGroup::class, 'group_id');
    }

    public function parentIndicator(): BelongsTo
    {
        return $this->belongsTo(KpiIndicator::class, 'parent_indicator_id');
    }

    public function childIndicators(): HasMany
    {
        return $this->hasMany(KpiIndicator::class, 'parent_indicator_id');
    }

    public function annualTargets(): HasMany
    {
        return $this->hasMany(KpiAnnualTarget::class, 'indicator_id');
    }

    /**
     * Get the needs that link to this KPI indicator.
     */
    public function needs(): BelongsToMany
    {
        return $this->belongsToMany(Need::class, 'kpi_indicator_need', 'kpi_indicator_id', 'need_id');
    }
}
