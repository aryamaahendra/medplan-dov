<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePlanningActivityRequest extends FormRequest
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
            'parent_id' => ['nullable', 'exists:planning_activities,id'],
            'type' => ['required', 'in:program,activity,sub_activity,output'],
            'full_code' => ['nullable', 'string', 'max:255'],
        ];
    }
}
