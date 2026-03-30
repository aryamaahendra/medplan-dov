<?php

namespace App\Models;

use Database\Factories\SasaranFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    public function tujuan()
    {
        return $this->belongsTo(Tujuan::class);
    }

    /**
     * Get the indicators for the sasaran.
     */
    public function indicators()
    {
        return $this->hasMany(Indicator::class);
    }
}
