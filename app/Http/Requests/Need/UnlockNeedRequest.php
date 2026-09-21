<?php

namespace App\Http\Requests\Need;

use Illuminate\Foundation\Http\FormRequest;

class UnlockNeedRequest extends FormRequest
{
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
     * @return array{lock_reason: array<int, string>, unlocked_until: array<int, string>}
     */
    public function rules(): array
    {
        return [
            'lock_reason' => ['required', 'string', 'max:500'],
            'unlocked_until' => ['nullable', 'date', 'after:now'],
        ];
    }
}
