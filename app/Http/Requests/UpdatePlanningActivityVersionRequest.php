<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePlanningActivityVersionRequest extends FormRequest
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
            'code' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string'],
            'type' => ['required', 'in:program,activity,sub_activity,output'],
            'parent_id' => ['nullable', 'exists:planning_activity_versions,id'],
            'indicators' => ['nullable', 'array'],
            'indicators.*.id' => ['nullable', 'integer'],
            'indicators.*.name' => ['required_with:indicators', 'string', 'max:255'],
            'indicators.*.baseline' => ['nullable', 'string', 'max:255'],
            'indicators.*.unit' => ['nullable', 'string', 'max:255'],
            'perangkat_daerah' => ['nullable', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
