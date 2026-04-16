<?php

namespace App\Actions\Need;

use App\Models\Need;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class UpdateNeedAction
{
    public function __construct(
        protected DeleteNeedAttachmentAction $deleteAttachmentAction
    ) {}

    /**
     * Execute the action.
     *
     * @param  UploadedFile[]|null  $attachments
     * @param  UploadedFile[]|null  $technicalSpecificationAttachments
     */
    public function execute(
        Need $need,
        array $data,
        ?array $attachments = null,
        array $attachmentNames = [],
        ?array $technicalSpecificationAttachments = null,
        array $technicalSpecificationAttachmentNames = []
    ): Need {
        return DB::transaction(function () use ($need, $data, $attachments, $attachmentNames, $technicalSpecificationAttachments, $technicalSpecificationAttachmentNames) {
            $need->update(collect($data)->except([
                'detail',
                'sasaran_ids',
                'indicator_ids',
                'kpi_indicator_ids',
                'strategic_service_plan_ids',
                'planning_activity_version_ids',
                'planning_activity_indicator_ids',
                'attachments',
                'attachment_names',
                'technical_specification_attachments',
                'technical_specification_attachment_names',
                'deleted_attachment_ids',
                'is_priority',
            ])->merge([
                'is_priority' => ($data['urgency'] ?? $need->urgency) === 'high' && ($data['impact'] ?? $need->impact) === 'high',
            ])->toArray());

            $need->sasarans()->sync($data['sasaran_ids'] ?? []);
            $need->indicators()->sync($data['indicator_ids'] ?? []);
            $need->kpiIndicators()->sync($data['kpi_indicator_ids'] ?? []);
            $need->strategicServicePlans()->sync($data['strategic_service_plan_ids'] ?? []);
            $need->planningActivityVersions()->sync($data['planning_activity_version_ids'] ?? []);
            $need->planningActivityIndicators()->sync($data['planning_activity_indicator_ids'] ?? []);

            $need->detail()->updateOrCreate(
                ['need_id' => $need->id],
                $data['detail'] ?? []
            );

            // Handle deletions
            if (! empty($data['deleted_attachment_ids'])) {
                $attachmentsToDelete = $need->attachments()
                    ->whereIn('id', $data['deleted_attachment_ids'])
                    ->get();

                foreach ($attachmentsToDelete as $attToDel) {
                    $this->deleteAttachmentAction->execute($attToDel);
                }
            }

            if ($attachments) {
                foreach ($attachments as $index => $file) {
                    $displayName = $attachmentNames[$index] ?? $file->getClientOriginalName();
                    $path = $file->store("needs/{$need->id}", 'local');

                    $need->attachments()->create([
                        'category' => 'general',
                        'display_name' => $displayName,
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'extension' => $file->getClientOriginalExtension(),
                    ]);
                }
            }

            if ($technicalSpecificationAttachments) {
                foreach ($technicalSpecificationAttachments as $index => $file) {
                    $displayName = $technicalSpecificationAttachmentNames[$index] ?? $file->getClientOriginalName();
                    $path = $file->store("needs/{$need->id}/technical_specifications", 'local');

                    $need->attachments()->create([
                        'category' => 'technical_specifications',
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
