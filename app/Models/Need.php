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
    'is_locked',
    'locked_at',
    'locked_by_user_id',
    'lock_reason',
    'unlocked_until',
])]
class Need extends Model
{
    /** @use HasFactory<NeedFactory> */
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
    ];

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
            'is_locked' => 'boolean',
            'locked_at' => 'datetime',
            'unlocked_until' => 'datetime',
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
     * Get the user who locked this need.
     */
    public function lockedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by_user_id');
    }

    /**
     * Determine whether the need is locked for the given user.
     */
    public function isLocked(?User $user = null): bool
    {
        if ($user && $user->hasRole('super-admin')) {
            return false;
        }

        if ($this->approved_by_director_at !== null) {
            return true;
        }

        if ($this->is_locked === true) {
            return true;
        }

        if ($this->unlocked_until !== null && $this->unlocked_until->isFuture()) {
            return false;
        }

        if ($this->is_locked === false) {
            return false;
        }

        $needGroup = $this->needGroup ?? NeedGroup::find($this->need_group_id);
        if ($needGroup && ! $needGroup->isOpenForSubmission()) {
            return true;
        }

        return false;
    }

    /**
     * Get the descriptive lock reason for this need.
     */
    public function getEffectiveLockReason(?User $user = null): ?string
    {
        if ($user && $user->hasRole('super-admin')) {
            return null;
        }

        if ($this->approved_by_director_at !== null) {
            return $this->lock_reason ?: 'Usulan telah disetujui oleh Direktur.';
        }

        if ($this->is_locked === true) {
            return $this->lock_reason ?: 'Usulan dikunci secara manual oleh perencana.';
        }

        if ($this->unlocked_until !== null && $this->unlocked_until->isFuture()) {
            return $this->lock_reason;
        }

        if ($this->is_locked === false) {
            return $this->lock_reason;
        }

        $needGroup = $this->needGroup ?? NeedGroup::find($this->need_group_id);
        if ($needGroup && ! $needGroup->isOpenForSubmission()) {
            if ($this->lock_reason) {
                return $this->lock_reason;
            }

            $status = $needGroup->getSubmissionWindowStatus();
            if ($status === 'upcoming') {
                return 'Periode pengajuan usulan kebutuhan untuk kelompok ini belum dibuka.';
            }

            return 'Periode pengajuan usulan kebutuhan untuk kelompok ini telah ditutup.';
        }

        return $this->lock_reason;
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
