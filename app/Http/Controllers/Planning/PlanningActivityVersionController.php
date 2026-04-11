<?php

namespace App\Http\Controllers\Planning;

use App\Http\Controllers\Controller;
use App\Http\Requests\Planning\StorePlanningActivityVersionRequest;
use App\Http\Requests\Planning\UpdatePlanningActivityVersionRequest;
use App\Models\PlanningActivityIndicator;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningVersion;
use App\Traits\HasDataTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanningActivityVersionController extends Controller
{
    use HasDataTable;

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['code', 'name', 'full_code'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['code', 'name', 'type', 'sort_order'];

    /**
     * Display a listing of activities for the given version.
     */
    public function index(PlanningVersion $planningVersion, Request $request): Response
    {
        $query = PlanningActivityVersion::query()
            ->where('planning_version_id', $planningVersion->id)
            ->with(['activityYears', 'indicators.activityYears', 'parent']);

        if (! $request->has('sort')) {
            $query->orderBy('code', 'asc');
        }

        $activities = $this->applyDataTable(
            $query,
            $request,
            self::SEARCH_COLUMNS,
            self::SORTABLE_COLUMNS,
            50 // Higher default for snapshots
        );

        $flattened = $activities->getCollection()->flatMap(function ($activity) {
            if ($activity->indicators->isEmpty()) {
                $activity->specific_indicator = null;

                return [$activity];
            }

            return $activity->indicators->map(function ($indicator) use ($activity) {
                $row = clone $activity;
                $row->setRelation('indicators', $activity->indicators); // Keep relation if needed
                $row->specific_indicator = $indicator;

                return $row;
            });
        });

        $activities->setCollection($flattened);

        return Inertia::render('planning/activity-versions/index', [
            'version' => $planningVersion,
            'activities' => $activities,
            'filters' => $this->dataTableFilters($request, 50),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(PlanningVersion $planningVersion)
    {
        return Inertia::render('planning/activity-versions/create', [
            'version' => $planningVersion,
            'parents' => PlanningActivityVersion::query()
                ->where('planning_version_id', $planningVersion->id)
                ->whereIn('type', ['program', 'activity', 'sub_activity'])
                ->orderBy('code')
                ->get(['id', 'name', 'type', 'code']),
        ]);
    }

    /**
     * Store a newly created snapshot activity.
     */
    public function store(PlanningVersion $planningVersion, StorePlanningActivityVersionRequest $request)
    {
        $validated = $request->validated();
        $activity = $planningVersion->activityVersions()->create($validated);

        if ($request->has('indicators')) {
            foreach ($request->indicators as $indicatorData) {
                if (! empty($indicatorData['name'])) {
                    $activity->indicators()->create([
                        'name' => $indicatorData['name'],
                        'baseline' => $indicatorData['baseline'] ?? null,
                        'unit' => $indicatorData['unit'] ?? null,
                    ]);
                }
            }
        }

        return redirect()->route('planning-versions.activities.index', $planningVersion)
            ->with('success', 'Aktivitas Snapshot berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PlanningActivityVersion $planningActivityVersion)
    {
        $planningActivityVersion->load('indicators');
        $version = PlanningVersion::findOrFail($planningActivityVersion->planning_version_id);

        return Inertia::render('planning/activity-versions/edit', [
            'version' => $version,
            'activity' => $planningActivityVersion,
            'parents' => PlanningActivityVersion::query()
                ->where('planning_version_id', $version->id)
                ->where('id', '!=', $planningActivityVersion->id)
                ->whereIn('type', ['program', 'activity', 'sub_activity'])
                ->orderBy('code')
                ->get(['id', 'name', 'type', 'code']),
        ]);
    }

    /**
     * Update the snapshot activity.
     */
    public function update(PlanningActivityVersion $planningActivityVersion, UpdatePlanningActivityVersionRequest $request)
    {
        $validated = $request->validated();
        $planningActivityVersion->update($validated);

        if ($request->has('indicators')) {
            $existingIndicatorIds = [];
            foreach ($request->indicators as $indicatorData) {
                if (empty($indicatorData['name'])) {
                    continue;
                }

                if (! empty($indicatorData['id'])) {
                    $indicator = $planningActivityVersion->indicators()->find($indicatorData['id']);
                    if ($indicator) {
                        $indicator->update([
                            'name' => $indicatorData['name'],
                            'baseline' => $indicatorData['baseline'] ?? null,
                            'unit' => $indicatorData['unit'] ?? null,
                        ]);
                        $existingIndicatorIds[] = $indicator->id;
                    }
                } else {
                    $newIndicator = $planningActivityVersion->indicators()->create([
                        'name' => $indicatorData['name'],
                        'baseline' => $indicatorData['baseline'] ?? null,
                        'unit' => $indicatorData['unit'] ?? null,
                    ]);
                    $existingIndicatorIds[] = $newIndicator->id;
                }
            }
            $planningActivityVersion->indicators()->whereNotIn('id', $existingIndicatorIds)->delete();
        } else {
            $planningActivityVersion->indicators()->delete();
        }

        return redirect()->route('planning-versions.activities.index', $planningActivityVersion->planning_version_id)
            ->with('success', 'Aktivitas Snapshot berhasil diperbarui.');
    }

    /**
     * Check if code already exists in the version.
     */
    public function checkCode(PlanningVersion $planningVersion, Request $request)
    {
        $exists = PlanningActivityVersion::where('planning_version_id', $planningVersion->id)
            ->where('code', $request->code)
            ->when($request->ignore_id, fn ($q) => $q->where('id', '!=', $request->ignore_id))
            ->exists();

        return response()->json(['exists' => $exists]);
    }

    /**
     * Remove the snapshot activity.
     */
    public function destroy(PlanningActivityVersion $planningActivityVersion)
    {
        $planningActivityVersion->delete();

        return redirect()->back()
            ->with('success', 'Aktivitas Snapshot berhasil dihapus.');
    }

    /**
     * Update or create yearly target/budget for an activity or indicator.
     */
    public function updateYearlyData(Request $request)
    {
        $request->validate([
            'yearable_id' => 'required|integer',
            'yearable_type' => 'required|string|in:activity,indicator',
            'year' => 'required|integer',
            'target' => 'nullable|string',
            'budget' => 'nullable|numeric',
        ]);

        $modelClass = $request->yearable_type === 'activity'
            ? PlanningActivityVersion::class
            : PlanningActivityIndicator::class;

        $model = $modelClass::findOrFail($request->yearable_id);

        $model->activityYears()->updateOrCreate(
            ['year' => $request->year],
            [
                'target' => $request->target,
                'budget' => $request->budget,
            ]
        );

        return redirect()->back()
            ->with('success', "Data tahun {$request->year} berhasil diperbarui.");
    }
}
