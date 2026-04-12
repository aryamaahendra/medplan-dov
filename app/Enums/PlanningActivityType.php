<?php

// /home/meeatwork/Workspace/client/faraa-latsarapp-laravel-react/app/Enums/PlanningActivityType.php

namespace App\Enums;

enum PlanningActivityType: string
{
    case Program = 'PROGRAM';
    case Outcome = 'OUTCOME';
    case Kegiatan = 'KEGIATAN';
    case Subkegiatan = 'SUBKEGIATAN';
    case Output = 'OUTPUT';

    public function label(): string
    {
        return match ($this) {
            self::Program => 'Program',
            self::Outcome => 'Outcome',
            self::Kegiatan => 'Kegiatan',
            self::Subkegiatan => 'Subkegiatan',
            self::Output => 'Output',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
