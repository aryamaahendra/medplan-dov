<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\KpiAnnualTargetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'indicator_id',
    'year',
    'target_value',
])]
class KpiAnnualTarget extends Model
{
    /** @use HasFactory<KpiAnnualTargetFactory> */
    use HasFactory;

    protected $casts = [
        'year' => 'integer',
    ];

    public function indicator(): BelongsTo
    {
        return $this->belongsTo(KpiIndicator::class, 'indicator_id');
    }
}
