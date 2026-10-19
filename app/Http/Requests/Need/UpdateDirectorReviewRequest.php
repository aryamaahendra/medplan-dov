<?php

declare(strict_types=1);

namespace App\Http\Requests\Need;

use App\Models\Need;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $need = $this->resolveNeed();
        // Backward compatibility for legacy callers passing is_approved
        if (! $this->has('decision') && $this->has('is_approved')) {
            $isApproved = $this->boolean('is_approved');
            $this->merge([
                'decision' => $isApproved ? Need::STATUS_APPROVED : Need::STATUS_REVISION,
                'approved_volume' => $this->input('approved_volume', $need?->volume),
                'approved_unit_price' => $this->input('approved_unit_price', $need?->unit_price),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array{
     *     decision: array<int, mixed>,
     *     notes: array<int, mixed>,
     *     approved_volume: array<int, mixed>,
     *     approved_unit_price: array<int, mixed>,
     *     is_recommended_for_next_cycle: array<int, string>
     * }
     */
    public function rules(): array
    {
        $need = $this->resolveNeed();
        $maxVolume = $need ? (float) $need->volume : null;

        return [
            'decision' => [
                'required',
                'string',
                Rule::in([Need::STATUS_APPROVED, Need::STATUS_REJECTED, Need::STATUS_REVISION]),
            ],
            'notes' => [
                Rule::requiredIf(fn () => $this->input('decision') === Need::STATUS_REVISION),
                'nullable',
                'string',
            ],
            'approved_volume' => [
                Rule::requiredIf(fn () => $this->input('decision') === Need::STATUS_APPROVED),
                'nullable',
                'numeric',
                'gt:0',
                ...($maxVolume !== null ? ["lte:{$maxVolume}"] : []),
            ],
            'approved_unit_price' => [
                Rule::requiredIf(fn () => $this->input('decision') === Need::STATUS_APPROVED),
                'nullable',
                'numeric',
                'gte:0',
            ],
            'is_recommended_for_next_cycle' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    /**
     * Resolve the target Need model from route parameters.
     */
    private function resolveNeed(): ?Need
    {
        /** @var Need|int|string|null $need */
        $need = $this->route('need');
        if (! ($need instanceof Need) && is_numeric($need)) {
            $need = Need::query()->find($need);
        }

        return $need instanceof Need ? $need : null;
    }
}
