<?php

declare(strict_types=1);

namespace App\Http\Requests\Need;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreNeedAttachmentRequest extends FormRequest
{
    private const int MAX_FILE_SIZE_KB = 51200;

    private const array ALLOWED_MIMES = [
        'jpg', 'jpeg', 'png', 'gif', 'webp',
        'pdf', 'doc', 'docx', 'zip', 'rar',
        'mp4', 'webm', 'ogg',
    ];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:'.self::MAX_FILE_SIZE_KB,
                'mimes:'.implode(',', self::ALLOWED_MIMES),
            ],
            'category' => ['sometimes', 'string', Rule::in(['general', 'technical_specifications'])],
            'display_name' => ['nullable', 'string', 'max:255'],
            'extension' => ['sometimes', 'nullable', 'string'],
            'file_size' => ['sometimes', 'nullable', 'integer'],
        ];
    }
}
