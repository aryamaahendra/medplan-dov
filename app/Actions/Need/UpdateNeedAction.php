<?php

namespace App\Actions\Need;

use App\Models\Need;
use Illuminate\Support\Facades\DB;

class UpdateNeedAction
{
    /**
     * Execute the action.
     */
    public function execute(Need $need, array $data): Need
    {
        return DB::transaction(function () use ($need, $data) {
            $need->update(collect($data)->except([
                'detail',
                'sasaran_ids',
                'indicator_ids',
                'kpi_indicator_ids',
                'strategic_service_plan_ids',
                'planning_activity_version_ids',
                'planning_activity_indicator_ids',
                'is_priority',
            ])->merge([
                'is_priority' => ($data['urgency'] ?? $need->urgency) === 'high' && ($data['impact'] ?? $need->impact) === 'high',
            ])->toArray());

            $need->sasarans()->sync($data['sasaran_ids'] ?? []);
            $need->indicators()->sync($data['indicator_ids'] ?? []);
            $need->kpiIndicators()->sync($data['kpi_indicator_ids'] ?? []);
            $need->strategicServicePlans()->sync($data['strategic_service_plan_ids'] ?? []);
            $need->planningActivityVersions()->sync($data['planning_activity_version_ids'] ?? []);
            $need->planningActivityIndicators()->sync($data['planning_activity_indicator_ids'] ?? []);

            $need->detail()->updateOrCreate(
                ['need_id' => $need->id],
                $data['detail'] ?? []
            );

            return $need;
        });
    }
}
