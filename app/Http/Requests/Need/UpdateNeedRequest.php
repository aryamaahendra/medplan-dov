<?php

namespace App\Http\Requests\Need;

use App\Enums\Impact;
use App\Enums\Urgency;
use App\Models\Indicator;
use App\Models\Need;
use App\Models\OrganizationalUnit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNeedRequest extends FormRequest
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
    protected function prepareForValidation(): void
    {
        $user = $this->user();
        if ($user->hasRole('super-admin')) {
            return;
        }

        $permissionMap = [
            'update need tab general' => [
                'need_group_id', 'organizational_unit_id', 'need_type_id', 'year',
                'title', 'description', 'current_condition', 'required_condition',
                'volume', 'unit', 'unit_price', 'total_price',
            ],
            'update need tab urgency' => ['urgency', 'impact', 'is_priority'],
            'update need tab strategic' => ['sasaran_ids', 'indicator_ids'],
            'update need tab ikk' => ['kpi_indicator_ids'],
            'update need tab rls' => ['strategic_service_plan_ids'],
            'update need tab planning' => ['planning_activity_version_ids', 'planning_activity_indicator_ids'],
            'update need tab detail' => ['detail'],
            'update need tab lampiran' => [
                'attachments', 'attachment_names', 'technical_specification_attachments',
                'technical_specification_attachment_names', 'deleted_attachment_ids',
            ],
        ];

        $allowedFields = [];
        foreach ($permissionMap as $permission => $fields) {
            if ($user->hasPermissionTo($permission)) {
                $allowedFields = array_merge($allowedFields, $fields);
            }
        }

        if ($user->hasPermissionTo('update need status')) {
            $allowedFields[] = 'status';
        }

        // Only keep allowed fields in the request
        $this->replace($this->only($allowedFields));
    }

    public function rules(): array
    {
        return [
            'need_group_id' => ['required', 'integer', 'exists:need_groups,id'],
            'organizational_unit_id' => [
                'required',
                'integer',
                'exists:organizational_units,id',
                function ($attribute, $value, $fail) {
                    $user = $this->user();
                    if ($user->hasRole('super-admin') || $user->hasPermissionTo('update any needs')) {
                        return;
                    }
                    if ($user->hasPermissionTo('update descendant needs')) {
                        if ($value == $user->organizational_unit_id) {
                            return;
                        }
                        $unit = OrganizationalUnit::find($value);
                        if ($unit && $user->organizational_unit_id && $unit->isDescendantOf($user->organizational_unit_id)) {
                            return;
                        }
                    } elseif ($user->hasPermissionTo('update needs') && $value == $user->organizational_unit_id) {
                        return;
                    }
                    $fail('Anda tidak memiliki izin untuk memindahkan usulan ke unit organisasi ini.');
                },
            ],
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
            'status' => ['sometimes', 'string', Rule::in(Need::STATUSES)],
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
            'detail.funding_source_id' => ['nullable'], // ID or string for new
            'detail.estimated_cost' => ['nullable', 'string'],
            'detail.implementation_period' => ['nullable', 'string'],
            'detail.expert_or_skilled_personnel' => ['nullable', 'string'],
            'detail.technical_specifications' => ['nullable', 'string'],
            'detail.training' => ['nullable', 'string'],
            'technical_specification_attachments' => ['nullable', 'array'],
            'technical_specification_attachments.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,pdf,doc,docx'],
            'technical_specification_attachment_names' => ['nullable', 'array'],
            'technical_specification_attachment_names.*' => ['string', 'max:255'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,pdf,doc,docx,zip,rar'],
            'attachment_names' => ['nullable', 'array'],
            'attachment_names.*' => ['string', 'max:255'],
            'deleted_attachment_ids' => ['nullable', 'array'],
            'deleted_attachment_ids.*' => ['exists:need_attachments,id'],
        ];
    }
}
