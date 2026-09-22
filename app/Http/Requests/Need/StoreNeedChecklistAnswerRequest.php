<?php

declare(strict_types=1);

namespace App\Http\Requests\Need;

use App\Enums\ChecklistAnswer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

final class StoreNeedChecklistAnswerRequest extends FormRequest
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
            'answers' => ['required', 'array'],
            'answers.*.checklist_question_id' => ['required', 'exists:checklist_questions,id'],
            'answers.*.answer' => ['required', new Enum(ChecklistAnswer::class)],
            'answers.*.notes' => ['nullable', 'string'],
        ];
    }
}
