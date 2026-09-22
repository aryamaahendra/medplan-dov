<?php

declare(strict_types=1);

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
        $disk = (string) config('filesystems.attachments_disk', config('filesystems.default', 'local'));

        if (Storage::disk($disk)->exists($attachment->file_path)) {
            Storage::disk($disk)->delete($attachment->file_path);
        }

        $attachment->delete();
    }
}
