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
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'need_group_id',
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
    'checklist_percentage',
    'notes',
    'approved_by_director_at',
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
            'checklist_percentage' => 'decimal:2',
            'approved_by_director_at' => 'datetime',
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
     * Get the need group this need belongs to.
     */
    public function needGroup(): BelongsTo
    {
        return $this->belongsTo(NeedGroup::class);
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

    /**
     * Get the KPI indicators for this need.
     */
    public function kpiIndicators(): BelongsToMany
    {
        return $this->belongsToMany(KpiIndicator::class, 'kpi_indicator_need', 'need_id', 'kpi_indicator_id');
    }

    /**
     * Get the strategic service plans for this need.
     */
    public function strategicServicePlans(): BelongsToMany
    {
        return $this->belongsToMany(StrategicServicePlan::class, 'need_strategic_service_plan', 'need_id', 'strategic_service_plan_id');
    }

    /**
     * Get the planning activity versions for this need.
     */
    public function planningActivityVersions(): BelongsToMany
    {
        return $this->belongsToMany(PlanningActivityVersion::class, 'need_planning_activity_version', 'need_id', 'planning_activity_version_id');
    }

    /**
     * Get the planning activity indicators for this need.
     */
    public function planningActivityIndicators(): BelongsToMany
    {
        return $this->belongsToMany(PlanningActivityIndicator::class, 'need_planning_activity_indicator', 'need_id', 'planning_activity_indicator_id');
    }

    /**
     * Get the detail/proposal information for this need.
     */
    public function detail(): HasOne
    {
        return $this->hasOne(NeedDetail::class);
    }

    /**
     * Get the checklist answers for this need.
     */
    public function checklistAnswers(): HasMany
    {
        return $this->hasMany(NeedChecklistAnswer::class);
    }

    /**
     * Get the attachments for this need.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(NeedAttachment::class);
    }

    /**
     * Scope a query to only include needs the user is authorized to see in index.
     */
    public function scopeIndexScope($query, User $user)
    {
        if ($user->hasAnyRole(['super-admin', 'admin', 'planner'])) {
            return $query;
        }

        return $query->where('organizational_unit_id', $user->organizational_unit_id);
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::deleting(function (Need $need) {
            if ($need->isForceDeleting()) {
                foreach ($need->attachments as $attachment) {
                    Storage::disk('local')->delete($attachment->file_path);
                }
            }
        });
    }
}
