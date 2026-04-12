<?php

namespace Tests\Feature;

use App\Enums\PlanningActivityType;
use App\Imports\PlanningImport;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningVersion;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('it derives types correctly based on code and parent', function () {
    $version = PlanningVersion::factory()->create([
        'year_start' => 2025,
        'year_end' => 2029,
    ]);

    $import = new PlanningImport($version->id, 'A1', 'O10');

    $rows = new Collection([
        // Program (2 dots)
        new Collection([
            '1.01.01 - Parent Program', // Label
            '', // Indicator
            'Baseline 1',
            '10', '1000', // 2025 T B
            '20', '2000', // 2026 T B
            '30', '3000', // 2027 T B
            '40', '4000', // 2028 T B
            '50', '5000', // 2029 T B
            '', '', // empty columns
            'Dept A', // PD
            'Ket A', // Ket
        ]),
        // Outcome (No code, next to Program)
        new Collection([
            'Outcome Item', // Label
            '', // Indicator
            '',
            '', '',
            '', '',
            '', '',
            '', '',
            '', '',
            '', '',
            'Dept A',
            'Ket A',
        ]),
        // Kegiatan (4 dots)
        new Collection([
            '1.01.01.1.01 - Child Kegiatan', // Label
            '',
            '',
            '', '1500',
            '', '',
            '', '',
            '', '',
            '', '',
            '', '',
            'Dept A',
            'Ket A',
        ]),
        // Output (No code, next to Kegiatan)
        new Collection([
            'Output Item', // Label
            '',
            '',
            '', '',
            '', '',
            '', '',
            '', '',
            '', '',
            '', '',
            'Dept A',
            'Ket A',
        ]),
        // Subkegiatan (5 dots)
        new Collection([
            '1.01.01.1.01.0001 - Sub Kegiatan', // Label
            '',
            '',
            '', '',
            '', '',
            '', '',
            '', '',
            '', '',
            '', '',
            'Dept A',
            'Ket A',
        ]),
        // Output (No code, next to Subkegiatan)
        new Collection([
            'Sub Output Item', // Label
            '',
            '',
            '', '',
            '', '',
            '', '',
            '', '',
            '', '',
            '', '',
            'Dept A',
            'Ket A',
        ]),
    ]);

    $import->collection($rows);

    $this->assertDatabaseHas('planning_activity_versions', [
        'code' => '1.01.01',
        'type' => PlanningActivityType::Program->value,
    ]);

    $this->assertDatabaseHas('planning_activity_versions', [
        'name' => 'Outcome Item',
        'type' => PlanningActivityType::Outcome->value,
    ]);

    $this->assertDatabaseHas('planning_activity_versions', [
        'code' => '1.01.01.1.01',
        'type' => PlanningActivityType::Kegiatan->value,
    ]);

    $this->assertDatabaseHas('planning_activity_versions', [
        'name' => 'Output Item',
        'type' => PlanningActivityType::Output->value,
    ]);

    $this->assertDatabaseHas('planning_activity_versions', [
        'code' => '1.01.01.1.01.0001',
        'type' => PlanningActivityType::Subkegiatan->value,
    ]);

    $this->assertDatabaseHas('planning_activity_versions', [
        'name' => 'Sub Output Item',
        'type' => PlanningActivityType::Output->value,
    ]);
});

test('it throws error for invalid dot counts', function () {
    $version = PlanningVersion::factory()->create();
    $import = new PlanningImport($version->id, 'A1', 'O1');

    $rows = new Collection([
        new Collection([
            '1.01 - One Dot Item', // 1 dot -> error
            '', '', '', '', '', '', '', '', '', '', '', '', '', '',
        ]),
    ]);

    $this->expectException(ValidationException::class);
    $this->expectExceptionMessage('Invalid code structure');

    $import->collection($rows);
});

test('it saves budget as null when value is - or null', function () {
    $version = PlanningVersion::factory()->create([
        'year_start' => 2025,
    ]);
    $import = new PlanningImport($version->id, 'A1', 'O1');

    $rows = new Collection([
        new Collection([
            '1.01.01 - Code',
            '', // No indicator
            '',
            '100', '-', // Year 2025: Target 100, Budget '-'
            '', '', '', '', '', '', '', '', '', '', '',
        ]),
    ]);

    $import->collection($rows);

    $activity = PlanningActivityVersion::where('code', '1.01.01')->first();

    $this->assertDatabaseHas('planning_activity_years', [
        'yearable_id' => $activity->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2025,
        'budget' => null,
    ]);
});

test('it forces null budget for Outcome and Kegiatan Output but follows value for Subkegiatan Output', function () {
    $version = PlanningVersion::factory()->create([
        'year_start' => 2025,
    ]);
    $import = new PlanningImport($version->id, 'A1', 'Q10');

    $rows = new Collection([
        // 1. Program
        new Collection([
            '1.01.01 - Program',
            '', '', '', '1000', // Budget 1000
            '', '', '', '', '', '', '', '', '', '', '',
        ]),
        // 2. Outcome (Force null)
        new Collection([
            'Outcome',
            '', '', '', '500', // Budget 500 in Excel
            '', '', '', '', '', '', '', '', '', '', '',
        ]),
        // 3. Kegiatan
        new Collection([
            '1.01.01.1.01 - Kegiatan',
            '', '', '', '2000', // Budget 2000
            '', '', '', '', '', '', '', '', '', '', '',
        ]),
        // 4. Output under Kegiatan (Force null)
        new Collection([
            'Kegiatan Output',
            '', '', '', '300', // Budget 300 in Excel
            '', '', '', '', '', '', '', '', '', '', '',
        ]),
        // 5. Subkegiatan
        new Collection([
            '1.01.01.1.01.0001 - Subkegiatan',
            '', '', '', '3000', // Budget 3000
            '', '', '', '', '', '', '', '', '', '', '',
        ]),
        // 6. Output under Subkegiatan (Follow value)
        new Collection([
            'Subkegiatan Output',
            '', '', '', '400', // Budget 400 in Excel
            '', '', '', '', '', '', '', '', '', '', '',
        ]),
    ]);

    $import->collection($rows);

    // Verify Outcome budget is null
    $outcome = PlanningActivityVersion::where('name', 'Outcome')->first();
    $this->assertDatabaseHas('planning_activity_years', [
        'yearable_id' => $outcome->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2025,
        'budget' => null,
    ]);

    // Verify Kegiatan Output budget is null
    $kegiatanOutput = PlanningActivityVersion::where('name', 'Kegiatan Output')->first();
    $this->assertDatabaseHas('planning_activity_years', [
        'yearable_id' => $kegiatanOutput->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2025,
        'budget' => null,
    ]);

    // Verify Subkegiatan Output budget follows value (400)
    $subkegiatanOutput = PlanningActivityVersion::where('name', 'Subkegiatan Output')->first();
    $this->assertDatabaseHas('planning_activity_years', [
        'yearable_id' => $subkegiatanOutput->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2025,
        'budget' => 400,
    ]);
});
