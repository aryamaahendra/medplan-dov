<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePlanningActivityVersionRequest extends FormRequest
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
            'indicator_name' => ['nullable', 'string', 'max:255'],
            'indicator_baseline_2024' => ['nullable', 'string', 'max:255'],
            'perangkat_daerah' => ['nullable', 'string', 'max:255'],
            'keterangan' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
