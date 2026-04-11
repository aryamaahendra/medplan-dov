<?php

namespace App\Http\Requests\Need;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNeedGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'year' => ['required', 'integer', 'min:2020', 'max:2030'],
            'is_active' => ['boolean'],
        ];
    }
}
