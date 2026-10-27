<?php

declare(strict_types=1);

namespace App\Http\Requests\Management;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

final class UpdateRoleMatrixRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'matrix' => ['required', 'array'],
            'matrix.*' => ['present', 'array'],
            'matrix.*.*' => ['integer', 'exists:permissions,id'],
        ];
    }
}
