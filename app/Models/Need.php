<?php

namespace App\Models;

use App\Enums\Impact;
use App\Enums\Urgency;
use Database\Factories\NeedFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'organizational_unit_id',
    'need_type_id',
    'year',
    'title',
    'description',
    'current_condition',
    'required_condition',
    'volume',
    'unit',
    'unit_price',
    'total_price',
    'urgency',
    'impact',
    'is_priority',
    'status',
])]
class Need extends Model
{
    /** @use HasFactory<NeedFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'volume' => 'decimal:4',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
            'is_priority' => 'boolean',
            'urgency' => Urgency::class,
            'impact' => Impact::class,
        ];
    }

    /**
     * Get the organizational unit this need belongs to.
     */
    public function organizationalUnit(): BelongsTo
    {
        return $this->belongsTo(OrganizationalUnit::class);
    }

    /**
     * Get the need type for this need.
     */
    public function needType(): BelongsTo
    {
        return $this->belongsTo(NeedType::class);
    }

    /**
     * Get the sasarans for this need.
     */
    public function sasarans(): BelongsToMany
    {
        return $this->belongsToMany(Sasaran::class);
    }

    /**
     * Get the indicators for this need.
     */
    public function indicators(): BelongsToMany
    {
        return $this->belongsToMany(Indicator::class, 'need_indicator', 'need_id', 'indicator_id');
    }
}
