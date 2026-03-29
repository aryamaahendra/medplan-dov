<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateIndicatorRequest extends FormRequest
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
            'renstra_id' => ['required', 'exists:renstras,id'],
            'name' => ['required', 'string', 'max:255'],
            'baseline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'targets' => ['required', 'array'],
            'targets.*.year' => ['required', 'integer'],
            'targets.*.target' => ['required', 'string', 'max:255'],
        ];
    }
}
