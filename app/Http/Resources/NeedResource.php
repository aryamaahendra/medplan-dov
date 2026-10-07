<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NeedResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $needGroup = $this->resource->relationLoaded('needGroup')
            ? $this->resource->needGroup
            : $this->resource->needGroup;

        return [
            'id' => $this->resource->id,
            'need_group_id' => $this->resource->need_group_id,
            'organizational_unit_id' => $this->resource->organizational_unit_id,
            'need_type_id' => $this->resource->need_type_id,
            'year' => $this->resource->year,
            'title' => $this->resource->title,
            'description' => $this->resource->description,
            'current_condition' => $this->resource->current_condition,
            'required_condition' => $this->resource->required_condition,
            'volume' => $this->resource->volume,
            'unit' => $this->resource->unit,
            'unit_price' => $this->resource->unit_price,
            'total_price' => $this->resource->total_price,
            'urgency' => $this->resource->urgency?->value ?? $this->resource->urgency,
            'impact' => $this->resource->impact?->value ?? $this->resource->impact,
            'is_priority' => (bool) $this->resource->is_priority,
            'status' => $this->resource->status,
            'checklist_percentage' => $this->resource->checklist_percentage,
            'notes' => $this->resource->notes,
            'approved_by_director_at' => $this->resource->approved_by_director_at?->toIso8601String(),
            'locked_at' => $this->resource->locked_at?->toIso8601String(),
            'locked_by_user_id' => $this->resource->locked_by_user_id,
            'created_at' => $this->resource->created_at?->toIso8601String(),
            'updated_at' => $this->resource->updated_at?->toIso8601String(),

            // Computed lock & window properties (objective state of the need, not actor-bypassed)
            'is_locked' => $this->resource->isLocked(),
            'lock_reason' => $this->resource->getEffectiveLockReason(),
            'unlocked_until' => $this->resource->unlocked_until?->toIso8601String(),
            'submission_window_status' => $needGroup?->getSubmissionWindowStatus() ?? 'indefinite',
            'group_submission_end_at' => $needGroup?->submission_end_at?->toIso8601String(),
            'stage' => $this->resource->getWorkflowStage(),
            // Capabilities
            'can' => [
                'update' => $request->user()?->can('update', $this->resource),
                'delete' => $request->user()?->can('delete', $this->resource),
                'approve' => $request->user()?->can('approve', $this->resource),
                'performChecklist' => $request->user()?->can('performChecklist', $this->resource),
                'lock' => $request->user()?->can('lock', $this->resource),
                'unlock' => $request->user()?->can('unlock', $this->resource),
            ],

            // Relations via whenLoaded
            'need_group' => $this->whenLoaded('needGroup'),
            'needGroup' => $this->whenLoaded('needGroup'),
            'organizational_unit' => $this->whenLoaded('organizationalUnit'),
            'need_type' => $this->whenLoaded('needType'),
            'sasarans' => $this->whenLoaded('sasarans'),
            'indicators' => $this->whenLoaded('indicators'),
            'kpi_indicators' => $this->whenLoaded('kpiIndicators'),
            'strategic_service_plans' => $this->whenLoaded('strategicServicePlans'),
            'planning_activity_versions' => $this->whenLoaded('planningActivityVersions'),
            'planning_activity_indicators' => $this->whenLoaded('planningActivityIndicators'),
            'detail' => $this->whenLoaded('detail'),
            'checklist_answers' => $this->whenLoaded('checklistAnswers'),
            'attachments' => $this->whenLoaded('attachments'),
            'locked_by_user' => $this->whenLoaded('lockedByUser'),
            'sasarans_count' => $this->whenCounted('sasarans'),
            'indicators_count' => $this->whenCounted('indicators'),
            'kpi_indicators_count' => $this->whenCounted('kpiIndicators'),
            'strategic_service_plans_count' => $this->whenCounted('strategicServicePlans'),
            'attachments_count' => $this->whenCounted('attachments'),
        ];
    }
}
