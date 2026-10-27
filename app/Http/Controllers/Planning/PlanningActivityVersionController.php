<?php

declare(strict_types=1);

namespace App\Http\Controllers\Planning;

use App\Enums\PlanningActivityType;
use App\Exports\PlanningHierarchyExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Planning\CheckActivityCodeRequest;
use App\Http\Requests\Planning\ImportPlanningActivitiesRequest;
use App\Http\Requests\Planning\StorePlanningActivityVersionRequest;
use App\Http\Requests\Planning\UpdatePlanningActivityVersionRequest;
use App\Http\Requests\Planning\UpdatePlanningActivityYearRequest;
use App\Imports\PlanningImport;
use App\Models\PlanningActivityIndicator;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningVersion;
use App\Traits\HasDataTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

final class PlanningActivityVersionController extends Controller
{
    use HasDataTable;

    public function __construct()
    {
        $this->authorizeResource(PlanningActivityVersion::class);
    }

    /** Columns searchable across */
    private const array SEARCH_COLUMNS = ['code', 'name', 'full_code'];

    /** Columns sortable by */
    private const array SORTABLE_COLUMNS = ['code', 'name', 'sort_order'];

    /**
     * Display a listing of activities for the given version.
     */
    public function index(PlanningVersion $planningVersion, Request $request): Response
    {
        $query = PlanningActivityVersion::query()
            ->where('planning_version_id', $planningVersion->id)
            ->with(['activityYears', 'indicators.activityYears', 'parent.activityYears']);

        if (! $request->has('sort')) {
            $query->orderBy('sort_order', 'asc')->orderBy('code', 'asc');
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
    public function create(PlanningVersion $planningVersion): Response
    {
        return Inertia::render('planning/activity-versions/create', [
            'version' => $planningVersion,
            'parents' => PlanningActivityVersion::query()
                ->where('planning_version_id', $planningVersion->id)
                ->whereNotNull('code')
                ->where('code', '!=', '')
                ->orderBy('code')
                ->get(['id', 'name', 'code'])
                ->filter(fn ($p) => ! preg_match('/[a-zA-Z]$/', $p->code))
                ->values(),
            'activityTypes' => PlanningActivityType::options(),
        ]);
    }

    /**
     * Store a newly created snapshot activity.
     */
    public function store(PlanningVersion $planningVersion, StorePlanningActivityVersionRequest $request): RedirectResponse
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
    public function edit(PlanningActivityVersion $planningActivityVersion): Response
    {
        $planningActivityVersion->load('indicators');
        $version = PlanningVersion::findOrFail($planningActivityVersion->planning_version_id);

        return Inertia::render('planning/activity-versions/edit', [
            'version' => $version,
            'activity' => $planningActivityVersion,
            'parents' => PlanningActivityVersion::query()
                ->where('planning_version_id', $version->id)
                ->where('id', '!=', $planningActivityVersion->id)
                ->whereNotNull('code')
                ->where('code', '!=', '')
                ->orderBy('code')
                ->get(['id', 'name', 'code'])
                ->filter(fn ($p) => ! preg_match('/[a-zA-Z]$/', $p->code))
                ->values(),
            'activityTypes' => PlanningActivityType::options(),
        ]);
    }

    /**
     * Update the snapshot activity.
     */
    public function update(PlanningActivityVersion $planningActivityVersion, UpdatePlanningActivityVersionRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $planningActivityVersion->update($validated);

        if ($request->has('indicators')) {
            $this->syncIndicators($planningActivityVersion, (array) $request->indicators);
        } else {
            $planningActivityVersion->indicators()->delete();
        }

        return redirect()->route('planning-versions.activities.index', $planningActivityVersion->planning_version_id)
            ->with('success', 'Aktivitas Snapshot berhasil diperbarui.');
    }

    /**
     * Check if code already exists in the version.
     */
    public function checkCode(PlanningVersion $planningVersion, CheckActivityCodeRequest $request): JsonResponse
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
    public function destroy(PlanningActivityVersion $planningActivityVersion): RedirectResponse
    {
        $planningActivityVersion->delete();

        return redirect()->back()
            ->with('success', 'Aktivitas Snapshot berhasil dihapus.');
    }

    /**
     * Update or create yearly target/budget for an activity or indicator.
     */
    public function updateYearlyData(PlanningActivityVersion $planningActivityVersion, UpdatePlanningActivityYearRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $yearableType = $validated['yearable_type'] ?? 'activity';
        $yearableId = $validated['yearable_id'] ?? $planningActivityVersion->id;

        $modelClass = $yearableType === 'activity'
            ? PlanningActivityVersion::class
            : PlanningActivityIndicator::class;

        $model = $modelClass::findOrFail($yearableId);

        $model->activityYears()->updateOrCreate(
            ['year' => $validated['year']],
            [
                'target' => $validated['target'] ?? null,
                'budget' => $validated['budget'] ?? null,
            ]
        );

        return redirect()->back()
            ->with('success', "Data tahun {$validated['year']} berhasil diperbarui.");
    }

    /**
     * Export planning activities to Excel.
     */
    public function export(PlanningVersion $planningVersion): BinaryFileResponse
    {
        $fileName = 'Perencanaan_'.str_replace(' ', '_', $planningVersion->name).'_'.date('Ymd_His').'.xlsx';

        return Excel::download(
            new PlanningHierarchyExport($planningVersion->id),
            $fileName
        );
    }

    /**
     * Import planning activities from Excel.
     */
    public function import(ImportPlanningActivitiesRequest $request, PlanningVersion $planningVersion): RedirectResponse
    {
        try {
            Excel::import(
                new PlanningImport(
                    $planningVersion->id,
                    $request->string('start_cell')->toString(),
                    $request->string('end_cell')->toString()
                ),
                $request->file('file')
            );
        } catch (ValidationException $e) {
            return redirect()->back()->withErrors($e->errors());
        } catch (Throwable $e) {
            report($e);

            return redirect()->back()->withErrors(['file' => 'Gagal mengimpor file. Silakan coba lagi atau periksa format file Anda.']);
        }

        return redirect()->back()->with('success', 'Data aktivitas perencanaan berhasil diimpor.');
    }

    /**
     * Sync indicators for the planning activity version.
     *
     * @param  array<int, array<string, mixed>>  $indicators
     */
    private function syncIndicators(PlanningActivityVersion $activity, array $indicators): void
    {
        $existingIndicatorIds = [];

        foreach ($indicators as $indicatorData) {
            if (empty($indicatorData['name'])) {
                continue;
            }

            if (! empty($indicatorData['id'])) {
                $indicator = $activity->indicators()->find($indicatorData['id']);
                if ($indicator) {
                    $indicator->update([
                        'name' => $indicatorData['name'],
                        'baseline' => $indicatorData['baseline'] ?? null,
                        'unit' => $indicatorData['unit'] ?? null,
                    ]);
                    $existingIndicatorIds[] = $indicator->id;
                }
            } else {
                $newIndicator = $activity->indicators()->create([
                    'name' => $indicatorData['name'],
                    'baseline' => $indicatorData['baseline'] ?? null,
                    'unit' => $indicatorData['unit'] ?? null,
                ]);
                $existingIndicatorIds[] = $newIndicator->id;
            }
        }

        $activity->indicators()->whereNotIn('id', $existingIndicatorIds)->delete();
    }
}
