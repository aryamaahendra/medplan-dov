<?php

declare(strict_types=1);

namespace App\Http\Requests\Planning;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

final class UpdatePlanningActivityYearRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'yearable_id' => ['nullable', 'integer'],
            'yearable_type' => ['nullable', 'string', 'in:activity,indicator'],
            'year' => ['required', 'integer'],
            'target' => ['nullable', 'string'],
            'budget' => ['nullable', 'numeric'],
        ];
    }
}
