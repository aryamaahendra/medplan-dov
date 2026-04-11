<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePlanningVersionRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'year_start' => 'required|integer|min:2020|max:2100',
            'year_end' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) {
                    if ($value != $this->year_start + 4) {
                        $fail('The end year must be 5 years after the start year (start year + 4).');
                    }
                },
            ],
            'notes' => 'nullable|string',
        ];
    }
}
