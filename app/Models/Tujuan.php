<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\TujuanFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'renstra_id',
    'name',
    'description',
])]
class Tujuan extends Model
{
    /** @use HasFactory<TujuanFactory> */
    use HasFactory;

    protected $casts = [
        'renstra_id' => 'integer',
    ];

    public function renstra(): BelongsTo
    {
        return $this->belongsTo(Renstra::class);
    }

    public function indicators(): HasMany
    {
        return $this->hasMany(Indicator::class);
    }

    public function sasarans(): HasMany
    {
        return $this->hasMany(Sasaran::class);
    }
}
