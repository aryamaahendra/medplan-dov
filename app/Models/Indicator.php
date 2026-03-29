<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Indicator extends Model
{
    use HasFactory;

    protected $fillable = [
        'renstra_id',
        'name',
        'baseline',
        'description',
    ];

    public function renstra(): BelongsTo
    {
        return $this->belongsTo(Renstra::class);
    }

    public function targets(): HasMany
    {
        return $this->hasMany(IndicatorTarget::class);
    }
}
