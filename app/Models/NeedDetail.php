<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'need_id',
    'background',
    'purpose_and_objectives',
    'target_objective',
    'procurement_organization_name',
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
     * Get the funding sources for this detail.
     */
    public function fundingSources(): BelongsToMany
    {
        return $this->belongsToMany(FundingSource::class, 'need_detail_funding_source');
    }
}
