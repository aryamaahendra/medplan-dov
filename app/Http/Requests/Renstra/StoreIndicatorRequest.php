<?php

namespace App\Http\Requests\Renstra;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreIndicatorRequest extends FormRequest
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
            'tujuan_id' => ['required_without:sasaran_id', 'nullable', 'exists:tujuans,id'],
            'sasaran_id' => ['required_without:tujuan_id', 'nullable', 'exists:sasarans,id'],
            'name' => ['required', 'string', 'max:255'],
            'baseline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'targets' => ['required', 'array'],
            'targets.*.year' => ['required', 'integer'],
            'targets.*.target' => ['required', 'string', 'max:255'],
        ];
    }
}
