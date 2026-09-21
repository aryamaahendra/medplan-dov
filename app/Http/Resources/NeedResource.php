<?php

namespace App\Http\Resources;

use App\Models\NeedGroup;
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
            : ($this->resource->need_group_id ? NeedGroup::find($this->resource->need_group_id) : null);

        return array_merge(parent::toArray($request), [
            'is_locked' => $this->resource->isLocked($request->user()),
            'lock_reason' => $this->resource->getEffectiveLockReason($request->user()),
            'unlocked_until' => $this->resource->unlocked_until?->toIso8601String(),
            'submission_window_status' => $needGroup?->getSubmissionWindowStatus() ?? 'indefinite',
            'group_submission_end_at' => $needGroup?->submission_end_at?->toIso8601String(),
            'can' => [
                'update' => $request->user()?->can('update', $this->resource),
                'delete' => $request->user()?->can('delete', $this->resource),
                'approve' => $request->user()?->can('approve', $this->resource),
                'performChecklist' => $request->user()?->can('performChecklist', $this->resource),
                'lock' => $request->user()?->can('lock', $this->resource),
                'unlock' => $request->user()?->can('unlock', $this->resource),
            ],
            'organizational_unit' => $this->whenLoaded('organizationalUnit'),
            'need_type' => $this->whenLoaded('needType'),
        ]);
    }
}
