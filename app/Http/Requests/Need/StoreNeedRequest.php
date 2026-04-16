<?php

namespace App\Http\Requests\Need;

use App\Enums\Impact;
use App\Enums\Urgency;
use App\Models\Indicator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNeedRequest extends FormRequest
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
            'need_group_id' => ['required', 'integer', 'exists:need_groups,id'],
            'organizational_unit_id' => ['required', 'integer', 'exists:organizational_units,id'],
            'need_type_id' => ['required', 'integer', 'exists:need_types,id'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'current_condition' => ['nullable', 'string'],
            'required_condition' => ['nullable', 'string'],
            'volume' => ['required', 'numeric', 'min:0'],
            'unit' => ['required', 'string', Rule::in(['pcs', 'unit', 'orang', 'paket', 'set', 'buah', 'lembar', 'kg', 'liter', 'meter'])],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'total_price' => ['required', 'numeric', 'min:0'],
            'urgency' => ['required', Rule::enum(Urgency::class)],
            'impact' => ['required', Rule::enum(Impact::class)],
            'is_priority' => ['boolean'],
            'status' => ['sometimes', 'string', Rule::in(['draft', 'submitted', 'approved', 'rejected'])],
            'sasaran_ids' => ['nullable', 'array'],
            'sasaran_ids.*' => ['exists:sasarans,id'],
            'indicator_ids' => ['nullable', 'array'],
            'indicator_ids.*' => [
                'exists:indicators,id',
                function ($attribute, $value, $fail) {
                    $indicator = Indicator::find($value);
                    if ($indicator && ! in_array($indicator->sasaran_id, $this->sasaran_ids ?? [])) {
                        $fail(__('Indikator yang dipilih harus sesuai dengan sasaran yang dipilih.'));
                    }
                },
            ],
            'kpi_indicator_ids' => ['nullable', 'array'],
            'kpi_indicator_ids.*' => ['exists:kpi_indicators,id'],
            'strategic_service_plan_ids' => ['nullable', 'array'],
            'strategic_service_plan_ids.*' => ['exists:strategic_service_plans,id'],
            'planning_activity_version_ids' => ['nullable', 'array'],
            'planning_activity_version_ids.*' => ['exists:planning_activity_versions,id'],
            'planning_activity_indicator_ids' => ['nullable', 'array'],
            'planning_activity_indicator_ids.*' => ['exists:planning_activity_indicators,id'],
            'detail.background' => ['nullable', 'string'],
            'detail.purpose_and_objectives' => ['nullable', 'string'],
            'detail.target_objective' => ['nullable', 'string'],
            'detail.procurement_organization_name' => ['nullable', 'string'],
            'detail.funding_source_and_estimated_cost' => ['nullable', 'string'],
            'detail.implementation_period' => ['nullable', 'string'],
            'detail.expert_or_skilled_personnel' => ['nullable', 'string'],
            'detail.technical_specifications' => ['nullable', 'string'],
            'detail.training' => ['nullable', 'string'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,pdf,doc,docx,zip,rar'],
            'attachment_names' => ['nullable', 'array'],
            'attachment_names.*' => ['string', 'max:255'],
            'technical_specification_attachments' => ['nullable', 'array'],
            'technical_specification_attachments.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,pdf,doc,docx'],
            'technical_specification_attachment_names' => ['nullable', 'array'],
            'technical_specification_attachment_names.*' => ['string', 'max:255'],
        ];
    }
}
