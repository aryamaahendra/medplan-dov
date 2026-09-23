<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\NeedAttachment;
use Illuminate\Http\UploadedFile;

class AddNeedAttachmentAction
{
    public function __construct(
        protected NeedProposalEngine $engine
    ) {}

    /**
     * Execute the action.
     *
     * @param  array{file: UploadedFile, display_name?: ?string, extension?: ?string, file_size?: ?int, category?: ?string}  $data
     */
    public function execute(Need $need, array $data): NeedAttachment
    {
        return $this->engine->addAttachment($need, $data);
    }
}
