<?php

namespace App\Actions\Need;

use App\Models\Need;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class StoreNeedAction
{
    /**
     * Execute the action.
     *
     * @param  UploadedFile[]|null  $attachments
     */
    public function execute(array $data, ?array $attachments = null, array $attachmentNames = []): Need
    {
        return DB::transaction(function () use ($data, $attachments, $attachmentNames) {
            $need = Need::create(collect($data)->except([
                'detail',
                'sasaran_ids',
                'indicator_ids',
                'kpi_indicator_ids',
                'strategic_service_plan_ids',
                'planning_activity_version_ids',
                'planning_activity_indicator_ids',
                'attachments',
                'attachment_names',
                'is_priority',
            ])->merge([
                'is_priority' => ($data['urgency'] ?? '') === 'high' && ($data['impact'] ?? '') === 'high',
            ])->toArray());

            $need->sasarans()->sync($data['sasaran_ids'] ?? []);
            $need->indicators()->sync($data['indicator_ids'] ?? []);
            $need->kpiIndicators()->sync($data['kpi_indicator_ids'] ?? []);
            $need->strategicServicePlans()->sync($data['strategic_service_plan_ids'] ?? []);
            $need->planningActivityVersions()->sync($data['planning_activity_version_ids'] ?? []);
            $need->planningActivityIndicators()->sync($data['planning_activity_indicator_ids'] ?? []);

            if (! empty($data['detail'])) {
                $need->detail()->create($data['detail']);
            }

            if ($attachments) {
                foreach ($attachments as $index => $file) {
                    $displayName = $attachmentNames[$index] ?? $file->getClientOriginalName();
                    $path = $file->store("needs/{$need->id}", 'local');

                    $need->attachments()->create([
                        'display_name' => $displayName,
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'extension' => $file->getClientOriginalExtension(),
                    ]);
                }
            }

            return $need;
        });
    }
}
