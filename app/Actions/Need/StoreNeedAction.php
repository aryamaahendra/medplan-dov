<?php

namespace App\Actions\Need;

use App\Models\Need;
use Illuminate\Http\UploadedFile;

class StoreNeedAction
{
    public function __construct(
        protected NeedProposalEngine $engine
    ) {}

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
        $payload = NeedProposalPayload::fromArray(
            data: $data,
            attachments: $attachments ?? [],
            attachmentNames: $attachmentNames,
            technicalSpecificationAttachments: $technicalSpecificationAttachments ?? [],
            technicalSpecificationAttachmentNames: $technicalSpecificationAttachmentNames
        );

        return $this->engine->submit($payload);
    }
}
