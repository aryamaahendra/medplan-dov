<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IndicatorTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'indicator_id',
        'year',
        'target',
    ];

    public function indicator(): BelongsTo
    {
        return $this->belongsTo(Indicator::class);
    }
}
