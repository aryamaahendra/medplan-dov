<?php

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

        $path = $file->store("needs/{$need->id}", 'local');

        return $need->attachments()->create([
            'display_name' => $displayName,
            'file_path' => $path,
            'file_size' => $fileSize,
            'mime_type' => $file->getMimeType(),
            'extension' => $extension,
        ]);
    }
}
