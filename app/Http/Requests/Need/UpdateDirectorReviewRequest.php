<?php

declare(strict_types=1);

namespace App\Http\Requests\Need;

use App\Models\Need;
use Illuminate\Foundation\Http\FormRequest;

final class UpdateDirectorReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $need = $this->route('need');

        if ($need instanceof Need) {
            return (bool) $this->user()?->can('approve', $need);
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string'],
            'is_approved' => ['required', 'boolean'],
        ];
    }
}
