<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Models\Need;
use App\Models\NeedAttachment;
use Illuminate\Http\UploadedFile;

class AddNeedAttachmentAction
{
    /**
     * Execute the action.
     */
    public function execute(Need $need, array $data): NeedAttachment
    {
        /** @var UploadedFile $file */
        $file = $data['file'];
        $displayName = $data['display_name'] ?? $file->getClientOriginalName();
        $extension = $data['extension'] ?? $file->getClientOriginalExtension();
        $fileSize = $data['file_size'] ?? $file->getSize();

        $disk = (string) config('filesystems.attachments_disk', config('filesystems.default', 'local'));

        $path = $file->store("needs/{$need->id}", $disk);

        return $need->attachments()->create([
            'display_name' => $displayName,
            'file_path' => $path,
            'file_size' => $fileSize,
            'mime_type' => $file->getMimeType(),
            'extension' => $extension,
        ]);
    }
}
