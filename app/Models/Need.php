<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\Impact;
use App\Enums\Urgency;
use Database\Factories\NeedFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
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
    'source_need_id',
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
    'approved_volume',
    'approved_unit_price',
    'approved_total_price',
    'is_recommended_for_next_cycle',
    'recommended_volume',
])]
class Need extends Model
{
    /** @use HasFactory<NeedFactory> */
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_SUBMITTED = 'submitted';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_REVISION = 'revision';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_SUBMITTED,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
        self::STATUS_REVISION,
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
            'approved_volume' => 'decimal:4',
            'approved_unit_price' => 'decimal:2',
            'approved_total_price' => 'decimal:2',
            'is_recommended_for_next_cycle' => 'boolean',
            'recommended_volume' => 'decimal:4',
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
     * Get the source need from which this need was rolled over.
     */
    public function sourceNeed(): BelongsTo
    {
        return $this->belongsTo(self::class, 'source_need_id');
    }

    /**
     * Get the needs rolled over from this need.
     */
    public function rolloverNeeds(): HasMany
    {
        return $this->hasMany(self::class, 'source_need_id');
    }

    /**
     * Get the user who locked this need.
     */
    public function lockedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by_user_id');
    }

    /**
     * Resolve the lock status and optional reason based on the system precedence hierarchy:
     * 1. Super Admin Bypass
     * 2. Temporary Extension Override (unlocked_until > now())
     * 3. Explicit Manual Override (is_locked === false or is_locked === true)
     * 4. Director Approval Trigger (approved_by_director_at IS NOT NULL)
     * 5. Need Group Submission Window
     *
     * @return array{is_locked: bool, reason: ?string}
     */
    public function resolveLockStatus(?User $user = null): array
    {
        if ($user && $user->hasRole('super-admin')) {
            return ['is_locked' => false, 'reason' => null];
        }

        if ($this->unlocked_until !== null && $this->unlocked_until->isFuture()) {
            return ['is_locked' => false, 'reason' => $this->lock_reason];
        }

        if ($this->is_locked === false) {
            return ['is_locked' => false, 'reason' => $this->lock_reason];
        }

        if ($this->approved_by_director_at !== null) {
            return [
                'is_locked' => true,
                'reason' => $this->lock_reason ?: 'Usulan telah disetujui oleh Direktur.',
            ];
        }

        if ($this->status === self::STATUS_SUBMITTED) {
            return [
                'is_locked' => true,
                'reason' => $this->lock_reason ?: 'Usulan sedang dalam proses review eksekutif.',
            ];
        }
        if ($this->status === self::STATUS_REJECTED) {
            return [
                'is_locked' => true,
                'reason' => $this->lock_reason ?: 'Usulan telah ditolak oleh Direktur.',
            ];
        }

        if ($this->is_locked === true) {
            return [
                'is_locked' => true,
                'reason' => $this->lock_reason ?: 'Usulan dikunci secara manual oleh perencana.',
            ];
        }

        $needGroup = $this->needGroup;
        if ($needGroup && ! $needGroup->isOpenForSubmission()) {
            if ($this->lock_reason) {
                return ['is_locked' => true, 'reason' => $this->lock_reason];
            }

            $status = $needGroup->getSubmissionWindowStatus();
            $reason = $status === 'upcoming'
                ? 'Periode pengajuan usulan kebutuhan untuk kelompok ini belum dibuka.'
                : 'Periode pengajuan usulan kebutuhan untuk kelompok ini telah ditutup.';

            return ['is_locked' => true, 'reason' => $reason];
        }

        return ['is_locked' => false, 'reason' => $this->lock_reason];
    }

    /**
     * Determine whether the need is locked for the given user.
     */
    public function isLocked(?User $user = null): bool
    {
        return $this->resolveLockStatus($user)['is_locked'];
    }

    /**
     * Get the descriptive lock reason for this need.
     */
    public function getEffectiveLockReason(?User $user = null): ?string
    {
        return $this->resolveLockStatus($user)['reason'];
    }

    /**
     * Determine whether the need has an explicit manual lock override.
     */
    public function isExplicitlyLocked(): bool
    {
        return $this->is_locked === true;
    }

    /**
     * Get the workflow stage for this need.
     * Returns one of: 'draft' | 'submitted' | 'approved' | 'rejected' | 'revision'
     */
    public function getWorkflowStage(): string
    {
        if (in_array($this->status, [
            self::STATUS_SUBMITTED,
            self::STATUS_REJECTED,
            self::STATUS_REVISION,
            self::STATUS_APPROVED,
        ], true)) {
            return $this->status;
        }

        if ($this->approved_by_director_at !== null) {
            return self::STATUS_APPROVED;
        }

        return self::STATUS_DRAFT;
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
     *
     * @return HasOne<NeedDetail, $this>
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
     *
     * @return HasMany<NeedAttachment, $this>
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(NeedAttachment::class);
    }

    /**
     * Scope a query to only include needs the user is authorized to see in index.
     */
    public function scopeIndexScope(Builder $query, User $user): Builder
    {
        if ($user->hasAnyRole(['super-admin', 'admin', 'planner'])) {
            return $query;
        }

        return $query->where('organizational_unit_id', $user->organizational_unit_id);
    }

    /**
     * Scope a query to unapproved candidate needs eligible for rollover into a target need group.
     */
    public function scopeUnapprovedCandidates(Builder $query, ?int $targetGroupId, User $user): Builder
    {
        $query->where(function (Builder $q): void {
            $q->whereNull('approved_by_director_at')
                ->orWhere(function (Builder $sub): void {
                    $sub->where('is_recommended_for_next_cycle', true)
                        ->where('recommended_volume', '>', 0);
                });
        });

        if ($targetGroupId !== null && $targetGroupId > 0) {
            $query->where('need_group_id', '!=', $targetGroupId)
                ->whereDoesntHave('rolloverNeeds', fn (Builder $q) => $q->where('need_group_id', $targetGroupId));
        }

        if (! $user->hasAnyRole(['super-admin', 'admin', 'planner']) && ! $user->can('view any needs')) {
            if ($user->can('view descendant needs') && $user->organizational_unit_id) {
                /** @var OrganizationalUnit|null $unit */
                $unit = $user->organizationalUnit;
                if ($unit) {
                    $unit->loadMissing('descendantsRecursive');
                    $allowedIds = [$unit->id];
                    $collectDescendants = function (OrganizationalUnit $u) use (&$collectDescendants, &$allowedIds): void {
                        /** @var OrganizationalUnit $descendant */
                        foreach ($u->descendantsRecursive as $descendant) {
                            $allowedIds[] = $descendant->id;
                            $collectDescendants($descendant);
                        }
                    };
                    $collectDescendants($unit);
                    $query->whereIn('organizational_unit_id', array_unique($allowedIds));
                } else {
                    $query->where('organizational_unit_id', $user->organizational_unit_id);
                }
            } else {
                $query->where('organizational_unit_id', $user->organizational_unit_id);
            }
        }

        return $query;
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::deleting(function (Need $need) {
            if ($need->isForceDeleting()) {
                $disk = (string) config('filesystems.attachments_disk', config('filesystems.default', 'local'));
                foreach ($need->attachments as $attachment) {
                    Storage::disk($disk)->delete($attachment->file_path);
                }
            }
        });
    }
}
