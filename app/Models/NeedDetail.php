<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'need_id',
    'background',
    'purpose_and_objectives',
    'target_objective',
    'procurement_organization_name',
    'funding_source_id',
    'estimated_cost',
    'implementation_period',
    'expert_or_skilled_personnel',
    'technical_specifications',
    'training',
])]
class NeedDetail extends Model
{
    use HasFactory;

    /**
     * Get the need this detail belongs to.
     */
    public function need(): BelongsTo
    {
        return $this->belongsTo(Need::class);
    }

    /**
     * Get the funding source for this detail.
     */
    public function fundingSource(): BelongsTo
    {
        return $this->belongsTo(FundingSource::class);
    }
}
