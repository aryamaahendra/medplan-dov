<?php

namespace App\Models;

use Database\Factories\PlanningVersionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanningVersion extends Model
{
    /** @use HasFactory<PlanningVersionFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'year_start',
        'year_end',
        'revision_no',
        'status',
        'is_current',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'is_current' => 'boolean',
            'year_start' => 'integer',
            'year_end' => 'integer',
            'revision_no' => 'integer',
        ];
    }

    public function activityVersions(): HasMany
    {
        return $this->hasMany(PlanningActivityVersion::class);
    }
}
