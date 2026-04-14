<?php

namespace App\Actions\Need;

use App\Models\NeedAttachment;
use Illuminate\Support\Facades\Storage;

class DeleteNeedAttachmentAction
{
    /**
     * Execute the action.
     */
    public function execute(NeedAttachment $attachment): void
    {
        if (Storage::disk('local')->exists($attachment->file_path)) {
            Storage::disk('local')->delete($attachment->file_path);
        }

        $attachment->delete();
    }
}
