<?php

declare(strict_types=1);

namespace App\DTOs\Need;

use Illuminate\Http\UploadedFile;

final readonly class NeedProposalPayload
{
    /**
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>|null  $detail
     * @param  array<int|string>|null  $fundingSources
     * @param  array<int, int>|null  $sasaranIds
     * @param  array<int, int>|null  $indicatorIds
     * @param  array<int, int>|null  $kpiIndicatorIds
     * @param  array<int, int>|null  $strategicServicePlanIds
     * @param  array<int, int>|null  $planningActivityVersionIds
     * @param  array<int, int>|null  $planningActivityIndicatorIds
     * @param  array<int, UploadedFile>  $generalAttachments
     * @param  array<int, string>  $generalAttachmentNames
     * @param  array<int, UploadedFile>  $technicalSpecificationAttachments
     * @param  array<int, string>  $technicalSpecificationAttachmentNames
     * @param  array<int, int>  $deletedAttachmentIds
     */
    public function __construct(
        public array $attributes,
        public ?array $detail = null,
        public ?array $fundingSources = null,
        public ?array $sasaranIds = null,
        public ?array $indicatorIds = null,
        public ?array $kpiIndicatorIds = null,
        public ?array $strategicServicePlanIds = null,
        public ?array $planningActivityVersionIds = null,
        public ?array $planningActivityIndicatorIds = null,
        public array $generalAttachments = [],
        public array $generalAttachmentNames = [],
        public array $technicalSpecificationAttachments = [],
        public array $technicalSpecificationAttachmentNames = [],
        public array $deletedAttachmentIds = [],
    ) {}

    /**
     * Build proposal payload from array data and optional uploaded files.
     *
     * @param  array<string, mixed>  $data
     * @param  array<int, UploadedFile>  $attachments
     * @param  array<int, string>  $attachmentNames
     * @param  array<int, UploadedFile>  $technicalSpecificationAttachments
     * @param  array<int, string>  $technicalSpecificationAttachmentNames
     */
    public static function fromArray(
        array $data,
        array $attachments = [],
        array $attachmentNames = [],
        array $technicalSpecificationAttachments = [],
        array $technicalSpecificationAttachmentNames = []
    ): self {
        $detailData = null;
        $fundingSources = null;

        if (array_key_exists('detail', $data) && is_array($data['detail'])) {
            $detailData = $data['detail'];
            if (array_key_exists('funding_source_ids', $detailData)) {
                $fundingSources = (array) $detailData['funding_source_ids'];
                unset($detailData['funding_source_ids']);
            }
        }

        $coreAttributes = collect($data)->except([
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
        ])->all();

        // Also check if files were passed inside $data directly
        $generalFiles = ! empty($attachments)
            ? $attachments
            : (isset($data['attachments']) && is_array($data['attachments']) ? $data['attachments'] : []);

        $generalNames = ! empty($attachmentNames)
            ? $attachmentNames
            : (isset($data['attachment_names']) && is_array($data['attachment_names']) ? $data['attachment_names'] : []);

        $techFiles = ! empty($technicalSpecificationAttachments)
            ? $technicalSpecificationAttachments
            : (isset($data['technical_specification_attachments']) && is_array($data['technical_specification_attachments']) ? $data['technical_specification_attachments'] : []);

        $techNames = ! empty($technicalSpecificationAttachmentNames)
            ? $technicalSpecificationAttachmentNames
            : (isset($data['technical_specification_attachment_names']) && is_array($data['technical_specification_attachment_names']) ? $data['technical_specification_attachment_names'] : []);

        $deletedIds = isset($data['deleted_attachment_ids']) && is_array($data['deleted_attachment_ids'])
            ? array_map('intval', $data['deleted_attachment_ids'])
            : [];

        return new self(
            attributes: $coreAttributes,
            detail: $detailData,
            fundingSources: $fundingSources,
            sasaranIds: array_key_exists('sasaran_ids', $data) ? (array) $data['sasaran_ids'] : null,
            indicatorIds: array_key_exists('indicator_ids', $data) ? (array) $data['indicator_ids'] : null,
            kpiIndicatorIds: array_key_exists('kpi_indicator_ids', $data) ? (array) $data['kpi_indicator_ids'] : null,
            strategicServicePlanIds: array_key_exists('strategic_service_plan_ids', $data) ? (array) $data['strategic_service_plan_ids'] : null,
            planningActivityVersionIds: array_key_exists('planning_activity_version_ids', $data) ? (array) $data['planning_activity_version_ids'] : null,
            planningActivityIndicatorIds: array_key_exists('planning_activity_indicator_ids', $data) ? (array) $data['planning_activity_indicator_ids'] : null,
            generalAttachments: $generalFiles,
            generalAttachmentNames: $generalNames,
            technicalSpecificationAttachments: $techFiles,
            technicalSpecificationAttachmentNames: $techNames,
            deletedAttachmentIds: $deletedIds,
        );
    }
}
