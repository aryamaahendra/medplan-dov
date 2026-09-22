<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'tujuan_id',
    'sasaran_id',
    'name',
    'baseline',
    'description',
])]
class Indicator extends Model
{
    use HasFactory;

    protected $casts = [
        'tujuan_id' => 'integer',
        'sasaran_id' => 'integer',
    ];

    public function tujuan(): BelongsTo
    {
        return $this->belongsTo(Tujuan::class);
    }

    public function sasaran(): BelongsTo
    {
        return $this->belongsTo(Sasaran::class);
    }

    public function targets(): HasMany
    {
        return $this->hasMany(IndicatorTarget::class);
    }

    /**
     * Get the needs that fulfill the indicator.
     */
    public function needs(): BelongsToMany
    {
        return $this->belongsToMany(Need::class);
    }
}
