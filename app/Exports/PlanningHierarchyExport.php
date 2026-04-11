<?php

namespace App\Exports;

use App\Models\PlanningActivityVersion;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithHeadings;

class PlanningHierarchyExport implements FromArray, WithCustomStartCell, WithHeadings
{
    protected $rows = [];

    protected $groupedActivities;

    protected $startCell;

    protected $planningVersionId;

    protected $counters = [];

    public function __construct(int $planningVersionId, string $startCell = 'A5')
    {
        $this->planningVersionId = $planningVersionId;
        $this->startCell = $startCell;
    }

    public function startCell(): string
    {
        return $this->startCell;
    }

    public function headings(): array
    {
        return [
            'Nomenklatur',
            'Indikator',
            'Baseline 2024',
            'Target 2026',
            'Pagu 2026',
            'Target 2027',
            'Pagu 2027',
            'Target 2028',
            'Pagu 2028',
            'Target 2029',
            'Pagu 2029',
            'Target 2030',
            'Pagu 2030',
            'Perangkat Daerah',
            'Keterangan',
        ];
    }

    public function array(): array
    {
        $allActivities = PlanningActivityVersion::with([
            'activityYears',
            'indicators.activityYears',
        ])
            ->where('planning_version_id', $this->planningVersionId)
            ->orderBy('sort_order', 'asc')
            ->get();

        $this->groupedActivities = $allActivities->groupBy('parent_id');

        $this->buildHierarchy(null, 0, '');

        return $this->rows;
    }

    protected function buildHierarchy($parentId, $level, $parentCode)
    {
        $items = $this->groupedActivities->get($parentId, []);

        foreach ($items as $item) {
            $code = $item->code;
            if (! $code) {
                if (! isset($this->counters[$parentCode])) {
                    $this->counters[$parentCode] = 1;
                } else {
                    $this->counters[$parentCode]++;
                }

                $paddedCounter = str_pad((string) $this->counters[$parentCode], 4, '0', STR_PAD_LEFT);
                $code = $parentCode ? $parentCode.'.'.$paddedCounter : $paddedCounter;
            }

            $indent = str_repeat(' ', $level * 2); // 2 spaces per level
            $label = $indent.$code.' - '.$item->name;

            $budgetMap = $item->activityYears->keyBy('year');

            if ($item->indicators->isEmpty()) {
                $this->rows[] = $this->buildRow(
                    $label,
                    '',
                    '',
                    $budgetMap,
                    collect(), // no target map
                    $item->perangkat_daerah,
                    $item->keterangan
                );
            } else {
                $first = true;
                foreach ($item->indicators as $indicator) {
                    $targetMap = $indicator->activityYears->keyBy('year');

                    $this->rows[] = $this->buildRow(
                        $first ? $label : '',
                        $indicator->name,
                        $indicator->baseline,
                        $first ? $budgetMap : collect(), // Add budget only on first row per rules
                        $targetMap,
                        $first ? $item->perangkat_daerah : '',
                        $first ? $item->keterangan : ''
                    );

                    $first = false;
                }
            }

            // recursively build children
            $this->buildHierarchy($item->id, $level + 1, $code);
        }
    }

    protected function buildRow($label, $indicatorName, $baseline, $budgetMap, $targetMap, $perangkatDaerah, $keterangan)
    {
        $row = [
            $label,
            $indicatorName,
            $baseline,
        ];

        $years = [2026, 2027, 2028, 2029, 2030];
        foreach ($years as $year) {
            $row[] = $targetMap->get($year)?->target ?? '';
            $row[] = $budgetMap->get($year)?->budget ?? '';
        }

        $row[] = $perangkatDaerah;
        $row[] = $keterangan;

        return $row;
    }
}
