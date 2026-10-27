<?php

declare(strict_types=1);

namespace App\Actions\Planning;

use App\Models\PlanningActivityIndicator;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningVersion;
use Illuminate\Support\Facades\DB;

class ClonePlanningVersionAction
{
    public function handle(PlanningVersion $source): PlanningVersion
    {
        return $this->execute($source);
    }

    public function execute(PlanningVersion $source): PlanningVersion
    {
        return DB::transaction(function () use ($source): PlanningVersion {
            $newVersion = PlanningVersion::create([
                'name' => $source->name.' Revision '.($source->revision_no + 1),
                'year_start' => $source->year_start,
                'year_end' => $source->year_end,
                'revision_no' => $source->revision_no + 1,
                'status' => 'draft',
                'is_current' => false,
                'notes' => 'Revision from '.$source->name,
            ]);

            $oldActivities = $source->activityVersions()->orderBy('id')->get();
            $idMapping = [];

            foreach ($oldActivities as $oldActivity) {
                $newActivity = $oldActivity->replicate();
                $newActivity->planning_version_id = $newVersion->id;
                $newActivity->parent_id = $oldActivity->parent_id ? ($idMapping[$oldActivity->parent_id] ?? null) : null;
                $newActivity->save();

                $idMapping[$oldActivity->id] = $newActivity->id;

                // Clone activity yearly data (budget)
                foreach ($oldActivity->activityYears as $oldYear) {
                    $newYear = $oldYear->replicate();
                    $newYear->yearable_id = $newActivity->id;
                    $newYear->yearable_type = PlanningActivityVersion::class;
                    $newYear->save();
                }

                // Clone indicators
                foreach ($oldActivity->indicators as $oldIndicator) {
                    $newIndicator = $oldIndicator->replicate();
                    $newIndicator->planning_activity_version_id = $newActivity->id;
                    $newIndicator->save();

                    // Clone indicator yearly data (target)
                    foreach ($oldIndicator->activityYears as $oldIndicatorYear) {
                        $newIndicatorYear = $oldIndicatorYear->replicate();
                        $newIndicatorYear->yearable_id = $newIndicator->id;
                        $newIndicatorYear->yearable_type = PlanningActivityIndicator::class;
                        $newIndicatorYear->save();
                    }
                }
            }

            return $newVersion;
        });
    }
}
