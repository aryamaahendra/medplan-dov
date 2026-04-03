<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreKpiIndicatorRequest extends FormRequest
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
            'group_id' => ['required', 'exists:kpi_groups,id'],
            'parent_indicator_id' => ['nullable', 'exists:kpi_indicators,id'],
            'name' => ['required', 'string'],
            'unit' => ['nullable', 'string', 'max:100', 'prohibited_if:is_category,true'],
            'is_category' => ['nullable', 'boolean'],
            'baseline_value' => ['nullable', 'string', 'max:32', 'prohibited_if:is_category,true'],
            'annual_targets' => ['nullable', 'array'],
            'annual_targets.*.year' => ['required_with:annual_targets', 'integer'],
            'annual_targets.*.target_value' => ['nullable', 'string', 'max:32'],
        ];
    }
}
