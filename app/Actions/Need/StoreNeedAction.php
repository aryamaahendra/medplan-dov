<?php

namespace App\Actions\Need;

use App\Models\FundingSource;
use App\Models\Need;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class StoreNeedAction
{
    /**
     * Execute the action.
     *
     * @param  UploadedFile[]|null  $attachments
     * @param  UploadedFile[]|null  $technicalSpecificationAttachments
     */
    public function execute(
        array $data,
        ?array $attachments = null,
        array $attachmentNames = [],
        ?array $technicalSpecificationAttachments = null,
        array $technicalSpecificationAttachmentNames = []
    ): Need {
        return DB::transaction(function () use ($data, $attachments, $attachmentNames, $technicalSpecificationAttachments, $technicalSpecificationAttachmentNames) {
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
                'technical_specification_attachments',
                'technical_specification_attachment_names',
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
                $detailData = $data['detail'];
                if (isset($detailData['funding_source_id']) && ! is_numeric($detailData['funding_source_id']) && ! empty($detailData['funding_source_id'])) {
                    $source = FundingSource::firstOrCreate(['name' => $detailData['funding_source_id']]);
                    $detailData['funding_source_id'] = $source->id;
                }
                $need->detail()->create($detailData);
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
