<?php

namespace App\Models;

use Database\Factories\SasaranFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sasaran extends Model
{
    /** @use HasFactory<SasaranFactory> */
    use HasFactory;

    protected $fillable = [
        'tujuan_id',
        'name',
        'description',
    ];

    /**
     * Get the tujuan that owns the sasaran.
     */
    public function tujuan(): BelongsTo
    {
        return $this->belongsTo(Tujuan::class);
    }

    /**
     * Get the indicators for the sasaran.
     */
    public function indicators(): HasMany
    {
        return $this->hasMany(Indicator::class);
    }

    /**
     * Get the needs that fulfill the sasaran.
     */
    public function needs(): BelongsToMany
    {
        return $this->belongsToMany(Need::class);
    }
}
