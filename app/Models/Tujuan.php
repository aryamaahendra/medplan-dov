<?php

namespace App\Models;

use Database\Factories\TujuanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tujuan extends Model
{
    /** @use HasFactory<TujuanFactory> */
    use HasFactory;

    protected $fillable = [
        'renstra_id',
        'name',
        'description',
    ];

    public function renstra()
    {
        return $this->belongsTo(Renstra::class);
    }

    public function indicators()
    {
        return $this->hasMany(Indicator::class);
    }
}
