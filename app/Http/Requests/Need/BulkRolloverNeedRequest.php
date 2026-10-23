<?php

declare(strict_types=1);

namespace App\Http\Requests\Need;

use App\Models\Need;
use App\Models\NeedGroup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class BulkRolloverNeedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'need_ids' => ['required', 'array', 'min:1'],
            'need_ids.*' => ['required', 'integer', 'exists:needs,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var NeedGroup|int|string|null $needGroup */
            $needGroup = $this->route('need_group');
            $targetGroupId = $needGroup instanceof NeedGroup
                ? $needGroup->id
                : (is_numeric($needGroup) ? (int) $needGroup : null);

            $needIds = $this->input('need_ids', []);
            if (! is_array($needIds) || empty($needIds)) {
                return;
            }

            $eligibleIds = Need::query()
                ->whereIn('id', $needIds)
                ->eligibleForRollover($targetGroupId)
                ->pluck('id')
                ->map(fn ($id): int => (int) $id)
                ->all();

            foreach ($needIds as $index => $id) {
                if (is_numeric($id) && ! in_array((int) $id, $eligibleIds, true)) {
                    $validator->errors()->add(
                        "need_ids.{$index}",
                        'Usulan yang dipilih tidak memenuhi syarat untuk ditarik ke kelompok ini.'
                    );
                }
            }
        });
    }
}
