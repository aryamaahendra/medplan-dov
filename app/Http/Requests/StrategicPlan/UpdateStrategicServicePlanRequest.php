<?php

namespace App\Http\Requests\StrategicPlan;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStrategicServicePlanRequest extends FormRequest
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
            'year' => ['sometimes', 'required', 'integer', 'min:2000'],
            'strategic_program' => ['sometimes', 'required', 'string', 'max:255'],
            'service_plan' => ['sometimes', 'required', 'string'],
            'target' => ['sometimes', 'required', 'string'],
            'policy_direction' => ['sometimes', 'required', 'string'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'service_plan' => 'rencana pengembangan layanan',
            'target' => 'sasaran',
        ];
    }
}
