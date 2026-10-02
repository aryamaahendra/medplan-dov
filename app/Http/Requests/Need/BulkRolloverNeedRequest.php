<?php

declare(strict_types=1);

namespace App\Http\Requests\Need;

use Illuminate\Foundation\Http\FormRequest;

class BulkRolloverNeedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'need_ids' => ['required', 'array', 'min:1'],
            'need_ids.*' => ['required', 'integer', 'exists:needs,id'],
        ];
    }
}
