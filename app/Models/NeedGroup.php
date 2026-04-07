<?php

namespace App\Models;

use Database\Factories\NeedGroupFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'name',
    'description',
    'year',
    'is_active',
    'need_count',
])]
class NeedGroup extends Model
{
    /** @use HasFactory<NeedGroupFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'is_active' => 'boolean',
            'need_count' => 'integer',
        ];
    }

    /**
     * Get the needs for this group.
     */
    public function needs(): HasMany
    {
        return $this->hasMany(Need::class);
    }
}
