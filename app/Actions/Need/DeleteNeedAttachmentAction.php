<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\NeedAttachment;

class DeleteNeedAttachmentAction
{
    public function __construct(
        protected NeedProposalEngine $engine
    ) {}

    /**
     * Execute the action.
     */
    public function execute(NeedAttachment $attachment): void
    {
        $this->engine->deleteAttachment($attachment);
    }
}
