<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\NeedAttachmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'need_id',
    'category',
    'display_name',
    'file_path',
    'file_size',
    'mime_type',
    'extension',
])]
class NeedAttachment extends Model
{
    /** @use HasFactory<NeedAttachmentFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    /**
     * Get the need this attachment belongs to.
     */
    public function need(): BelongsTo
    {
        return $this->belongsTo(Need::class);
    }
}
