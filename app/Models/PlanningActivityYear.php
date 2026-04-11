<?php

namespace App\Models;

use Database\Factories\PlanningActivityYearFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PlanningActivityYear extends Model
{
    /** @use HasFactory<PlanningActivityYearFactory> */
    use HasFactory;

    protected $fillable = [
        'yearable_id',
        'yearable_type',
        'year',
        'target',
        'budget',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'budget' => 'decimal:2',
        ];
    }

    public function yearable(): MorphTo
    {
        return $this->morphTo();
    }
}
