<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\KpiGroupFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'description',
    'start_year',
    'end_year',
    'is_active',
])]
class KpiGroup extends Model
{
    /** @use HasFactory<KpiGroupFactory> */
    use HasFactory;

    protected $casts = [
        'is_active' => 'boolean',
        'start_year' => 'integer',
        'end_year' => 'integer',
    ];

    public function indicators(): HasMany
    {
        return $this->hasMany(KpiIndicator::class, 'group_id');
    }
}
