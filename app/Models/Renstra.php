<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'year_start',
    'year_end',
    'description',
    'is_active',
])]
class Renstra extends Model
{
    use HasFactory;

    protected $casts = [
        'is_active' => 'boolean',
        'year_start' => 'integer',
        'year_end' => 'integer',
    ];

    public function tujuans(): HasMany
    {
        return $this->hasMany(Tujuan::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($renstra) {
            if ($renstra->is_active) {
                static::where('id', '!=', $renstra->id)
                    ->update(['is_active' => false]);
            }
        });
    }
}
