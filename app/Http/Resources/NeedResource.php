<?php

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
        return array_merge(parent::toArray($request), [
            'can' => [
                'update' => $request->user()?->can('update', $this->resource),
                'delete' => $request->user()?->can('delete', $this->resource),
                'approve' => $request->user()?->can('approve', $this->resource),
            ],
            'organizational_unit' => $this->whenLoaded('organizationalUnit'),
            'need_type' => $this->whenLoaded('needType'),
        ]);
    }
}
