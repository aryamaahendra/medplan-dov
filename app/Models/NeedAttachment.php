<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
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
    /**
     * Get the need this attachment belongs to.
     */
    public function need(): BelongsTo
    {
        return $this->belongsTo(Need::class);
    }
}
