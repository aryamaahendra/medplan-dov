<?php

namespace App\Http\Requests\StrategicPlan;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStrategicServicePlanRequest extends FormRequest
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
            'year' => ['required', 'integer', 'min:2000'],
            'strategic_program' => ['required', 'string', 'max:255'],
            'service_plan' => ['required', 'string'],
            'target' => ['required', 'string'],
            'policy_direction' => ['required', 'string'],
        ];
    }
}
