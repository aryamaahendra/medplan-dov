<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Renstra extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'year_start',
        'year_end',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function tujuans()
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
