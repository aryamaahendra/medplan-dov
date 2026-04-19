<?php

namespace App\Exports;

use App\Models\Need;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class NeedExport implements FromQuery, ShouldAutoSize, WithColumnFormatting, WithCustomStartCell, WithEvents, WithHeadings, WithMapping, WithStyles
{
    public function __construct(protected Builder $query)
    {
        //
    }

    public function startCell(): string
    {
        return 'B2';
    }

    public function query()
    {
        return $this->query;
    }

    public function headings(): array
    {
        return [
            'Tahun',
            'Judul Usulan',
            'Unit Kerja',
            'Jenis Usulan',
            'Volume',
            'Satuan',
            'Harga Satuan',
            'Total Harga',
            'Urgensi',
            'Dampak',
            'Prioritas',
            'Status',
            'Skor Checklist (%)',
            'Disetujui Direktur Pada',
        ];
    }

    /**
     * @param  Need  $row
     */
    public function map($row): array
    {
        return [
            $row->year,
            $row->title,
            $row->organizationalUnit?->name,
            $row->needType?->name,
            $row->volume,
            $row->unit,
            $row->unit_price,
            $row->total_price,
            $row->urgency?->label() ?? $row->urgency,
            $row->impact?->label() ?? $row->impact,
            $row->is_priority ? 'Ya' : 'Tidak',
            $row->status,
            (float) $row->checklist_percentage,
            $row->approved_by_director_at?->format('d/m/Y H:i') ?? '-',
        ];
    }

    public function columnFormats(): array
    {
        return [
            'H' => '"Rp " #,##0.00', // Shifted from G
            'I' => '"Rp " #,##0.00', // Shifted from H
            'N' => '0.00"%"', // Shifted from M
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            2 => [ // Row 2 is now the header row
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FFE0E0E0'],
                ],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn(); // Should be O starting from B

                // Apply borders to the table range
                $sheet->getStyle('B2:'.$highestColumn.$highestRow)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                        ],
                    ],
                ]);

                for ($row = 3; $row <= $highestRow; $row++) { // Data starts at row 3
                    // Urgency (J) - was I
                    $this->applyConditionalStyle($sheet, 'J', $row);
                    // Impact (K) - was J
                    $this->applyConditionalStyle($sheet, 'K', $row);

                    // Priority (L) - was K
                    $priority = $sheet->getCell('L'.$row)->getValue();
                    if ($priority === 'Ya') {
                        $this->setCellColor($sheet, 'L', $row, 'FFBCF0DA');
                    }

                    // Checklist (N) - was M
                    $checklist = (float) $sheet->getCell('N'.$row)->getValue();
                    if ($checklist >= 85) {
                        $this->setCellColor($sheet, 'N', $row, 'FFBCF0DA');
                    } elseif ($checklist >= 60) {
                        $this->setCellColor($sheet, 'N', $row, 'FFFDE68A');
                    } elseif ($checklist > 0) {
                        $this->setCellColor($sheet, 'N', $row, 'FFFCA5A5');
                    }
                }
            },
        ];
    }

    private function applyConditionalStyle(Worksheet $sheet, string $col, int $row): void
    {
        $val = $sheet->getCell($col.$row)->getValue();
        $color = match ($val) {
            'Tinggi' => 'FFFCA5A5', // Red
            'Sedang' => 'FFFDE68A', // Yellow
            'Rendah' => 'FFBCF0DA', // Green
            default => null,
        };

        if ($color) {
            $this->setCellColor($sheet, $col, $row, $color);
        }
    }

    private function setCellColor(Worksheet $sheet, string $col, int $row, string $argb): void
    {
        $sheet->getStyle($col.$row)->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => $argb],
            ],
        ]);
    }
}
