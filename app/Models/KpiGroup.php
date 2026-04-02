<?php

namespace App\Models;

use Database\Factories\KpiGroupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiGroup extends Model
{
    /** @use HasFactory<KpiGroupFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'start_year',
        'end_year',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_year' => 'integer',
        'end_year' => 'integer',
    ];

    public function indicators()
    {
        return $this->hasMany(KpiIndicator::class, 'group_id');
    }
}
