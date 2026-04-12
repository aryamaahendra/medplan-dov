<?php

namespace App\Imports;

use App\Enums\PlanningActivityType;
use App\Models\PlanningActivityIndicator;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use App\Models\PlanningVersion;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithLimit;
use Maatwebsite\Excel\Concerns\WithStartRow;

class PlanningImport implements ToCollection, WithLimit, WithStartRow
{
    protected int $versionId;

    protected int $startRow;

    protected int $endRow;

    protected array $stack = [];

    protected array $counters = [];

    protected array $processedActivityCodes = [];

    protected int $startYear;

    protected int $baseOrder;

    public function __construct(int $versionId, string $startCell, string $endCell)
    {
        $this->versionId = $versionId;
        $version = PlanningVersion::findOrFail($versionId);
        $this->startYear = $version->year_start;

        preg_match('/\d+/', $startCell, $s);
        preg_match('/\d+/', $endCell, $e);

        $this->startRow = (int) ($s[0] ?? 1);
        $this->endRow = (int) ($e[0] ?? 1000);

        $this->baseOrder = PlanningActivityVersion::where('planning_version_id', $versionId)->max('sort_order') ?? -1;
    }

    public function startRow(): int
    {
        return $this->startRow;
    }

    public function limit(): int
    {
        return $this->endRow - $this->startRow + 1;
    }

    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            $lastActivity = null;
            $lastCodedActivity = null;
            $currentLevel = 0;

            foreach ($rows as $index => $rowCollection) {
                $excelRow = $index + $this->startRow;
                $row = $rowCollection->toArray();

                if (count($row) < 15) {
                    throw ValidationException::withMessages(['file' => "Invalid column count at row {$excelRow}. Expected at least 15 columns."]);
                }

                $label = trim((string) ($row[0] ?? ''));
                $indicatorName = trim((string) ($row[1] ?? ''));

                if (! $label) {
                    if ($indicatorName && $lastActivity) {
                        // Continuation row for additional indicator
                        $activity = $lastActivity;
                        $level = $currentLevel;
                    } else {
                        continue; // Skip blank rows instead of a hard stop
                    }
                } else {
                    // Normal activity row
                    $parts = explode(' - ', trim($label), 2);
                    $hasCode = count($parts) === 2;
                    $code = $hasCode ? trim($parts[0]) : null;
                    $name = $hasCode ? trim($parts[1]) : trim($parts[0]);

                    if ($hasCode) {
                        // Coded row: level = number of dots (e.g. "1.02.01" → 2 dots → level 2)
                        $level = substr_count($code, '.');

                        $type = match ($level) {
                            2 => PlanningActivityType::Program,
                            4 => PlanningActivityType::Kegiatan,
                            5 => PlanningActivityType::Subkegiatan,
                            default => throw ValidationException::withMessages(['file' => "Invalid code structure at row {$excelRow}: '{$code}'. Expected 2, 4, or 5 dots for coded items."]),
                        };

                        // Find nearest parent in stack if hierarchy skips levels
                        $parent = null;
                        for ($l = $level - 1; $l >= 0; $l--) {
                            if (isset($this->stack[$l])) {
                                $parent = $this->stack[$l];
                                break;
                            }
                        }
                    } else {
                        $parent = $lastCodedActivity;
                        if (! $parent) {
                            throw ValidationException::withMessages(['file' => "No-code item at row {$excelRow} has no preceding coded activity."]);
                        }

                        $type = match ($parent->type) {
                            PlanningActivityType::Program => PlanningActivityType::Outcome,
                            PlanningActivityType::Kegiatan, PlanningActivityType::Subkegiatan => PlanningActivityType::Output,
                            default => throw ValidationException::withMessages(['file' => "Invalid parent type for no-code item at row {$excelRow}."]),
                        };

                        $level = substr_count($parent->code, '.') + 1;

                        $parentCode = $parent->code ?? '';
                        $this->counters[$parentCode] = ($this->counters[$parentCode] ?? 0) + 1;

                        $suffix = 'a';
                        for ($i = 1; $i < $this->counters[$parentCode]; $i++) {
                            $suffix++;
                        }

                        $code = $parentCode ? "{$parentCode}.{$suffix}" : $suffix;
                    }

                    $currentLevel = $level;

                    $activity = PlanningActivityVersion::updateOrCreate(
                        [
                            'planning_version_id' => $this->versionId,
                            'code' => $code,
                        ],
                        [
                            'parent_id' => $parent->id ?? null,
                            'name' => $name,
                            'type' => $type,
                            'full_code' => $code,
                            'perangkat_daerah' => $row[13] ?? null,
                            'keterangan' => $row[14] ?? null,
                            'sort_order' => $this->baseOrder + $index + 1,
                        ]
                    );

                    $lastActivity = $activity;
                    if ($hasCode) {
                        $lastCodedActivity = $activity;
                        $this->stack[$level] = $activity;

                        // Clean deeper levels to maintain stack accuracy
                        for ($i = $level + 1; $i <= 10; $i++) {
                            unset($this->stack[$i]);
                        }
                    }
                }

                $indicator = null;
                if ($indicatorName !== '') {
                    $indicator = PlanningActivityIndicator::updateOrCreate(
                        ['planning_activity_version_id' => $activity->id, 'name' => $indicatorName],
                        ['baseline' => $row[2] ?? null]
                    );
                }

                $years = [];
                for ($i = 0; $i < 5; $i++) {
                    $year = $this->startYear + $i;
                    $years[$year] = [3 + ($i * 2), 4 + ($i * 2)];
                }

                foreach ($years as $year => [$t, $b]) {
                    $targetStr = isset($row[$t]) ? trim((string) $row[$t]) : '';
                    $target = ($targetStr !== '' && $targetStr !== '-') ? str_replace(',', '.', $targetStr) : null;
                    $budgetRaw = isset($row[$b]) ? trim((string) $row[$b]) : '';
                    $budgetStr = ($budgetRaw !== '' && $budgetRaw !== '-') ? $budgetRaw : null;
                    $budget = $budgetStr !== null ? floatval(str_replace(['.', ','], ['', '.'], (string) $budgetStr)) : null;

                    // Force null budget for Outcome and Kegiatan Output
                    if (
                        $type === PlanningActivityType::Outcome ||
                        ($type === PlanningActivityType::Output && ($parent->type ?? null) === PlanningActivityType::Kegiatan)
                    ) {
                        $budget = null;
                    }

                    // Indicator target
                    if ($indicator) {
                        PlanningActivityYear::updateOrCreate(
                            [
                                'yearable_id' => $indicator->id,
                                'yearable_type' => PlanningActivityIndicator::class,
                                'year' => $year,
                            ],
                            ['target' => $target]
                        );
                    }

                    // Activity budget (only update on the primary activity row)
                    if ($label) {
                        PlanningActivityYear::updateOrCreate(
                            [
                                'yearable_id' => $activity->id,
                                'yearable_type' => PlanningActivityVersion::class,
                                'year' => $year,
                            ],
                            ['budget' => $budget]
                        );
                    }
                }
            }
        });
    }
}
