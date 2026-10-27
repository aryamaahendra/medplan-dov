<?php

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

/**
 * Helper to insert a test need row via query builder for migration testing.
 *
 * @param  array<string, mixed>  $attributes
 */
function insertTestNeed(array $attributes = []): int
{
    $needGroup = NeedGroup::factory()->create();
    $unit = OrganizationalUnit::factory()->create();
    $type = NeedType::factory()->create();

    return DB::table('needs')->insertGetId(array_merge([
        'need_group_id' => $needGroup->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $type->id,
        'year' => 2026,
        'title' => 'Test Need',
        'volume' => 10.0000,
        'unit' => 'unit',
        'unit_price' => 50000.00,
        'total_price' => 500000.00,
        'status' => 'draft',
        'created_at' => now(),
        'updated_at' => now(),
    ], $attributes));
}

test('need model defines canonical five-state status constants', function () {
    expect(Need::STATUS_DRAFT)->toBe('draft')
        ->and(Need::STATUS_SUBMITTED)->toBe('submitted')
        ->and(Need::STATUS_APPROVED)->toBe('approved')
        ->and(Need::STATUS_REJECTED)->toBe('rejected')
        ->and(Need::STATUS_REVISION)->toBe('revision')
        ->and(Need::STATUSES)->toBe([
            Need::STATUS_DRAFT,
            Need::STATUS_SUBMITTED,
            Need::STATUS_APPROVED,
            Need::STATUS_REJECTED,
            Need::STATUS_REVISION,
        ]);
});

test('need model casts decimal and boolean fields for approval and recommendation', function () {
    $need = new Need([
        'volume' => '10.0000',
        'unit_price' => '150000.00',
        'total_price' => '1500000.00',
        'approved_volume' => '8.5000',
        'approved_unit_price' => '140000.00',
        'approved_total_price' => '1190000.00',
        'is_recommended_for_next_cycle' => 1,
        'recommended_volume' => '1.5000',
    ]);

    expect($need->getCasts())->toHaveKeys([
        'approved_volume',
        'approved_unit_price',
        'approved_total_price',
        'is_recommended_for_next_cycle',
        'recommended_volume',
    ])
        ->and($need->getCasts()['approved_volume'])->toBe('decimal:4')
        ->and($need->getCasts()['approved_unit_price'])->toBe('decimal:2')
        ->and($need->getCasts()['approved_total_price'])->toBe('decimal:2')
        ->and($need->getCasts()['is_recommended_for_next_cycle'])->toBe('boolean')
        ->and($need->getCasts()['recommended_volume'])->toBe('decimal:4');
});

test('need model exposes approval and recommendation attributes in fillable', function () {
    $fillable = (new Need)->getFillable();

    expect($fillable)->toContain(
        'approved_volume',
        'approved_unit_price',
        'approved_total_price',
        'is_recommended_for_next_cycle',
        'recommended_volume',
    );
});

test('workflow stage resolution maps canonical statuses and approval timestamp', function () {
    $needDraft = new Need(['status' => Need::STATUS_DRAFT]);
    $needSubmitted = new Need(['status' => Need::STATUS_SUBMITTED]);
    $needApproved = new Need(['status' => Need::STATUS_APPROVED]);
    $needRejected = new Need(['status' => Need::STATUS_REJECTED]);
    $needRevision = new Need(['status' => Need::STATUS_REVISION]);
    $needStamptedDraft = new Need([
        'status' => Need::STATUS_DRAFT,
        'approved_by_director_at' => now(),
    ]);

    expect($needDraft->getWorkflowStage())->toBe('draft')
        ->and($needSubmitted->getWorkflowStage())->toBe('submitted')
        ->and($needApproved->getWorkflowStage())->toBe('approved')
        ->and($needRejected->getWorkflowStage())->toBe('rejected')
        ->and($needRevision->getWorkflowStage())->toBe('revision')
        ->and($needStamptedDraft->getWorkflowStage())->toBe('approved');
});

test('database migration adds approved and recommendation columns and composite index', function () {
    expect(Schema::hasColumns('needs', [
        'approved_volume',
        'approved_unit_price',
        'approved_total_price',
        'is_recommended_for_next_cycle',
        'recommended_volume',
    ]))->toBeTrue()
        ->and(Schema::hasIndex('needs', 'idx_needs_group_recommended'))->toBeTrue();
});

test('migration backfill transitions historically approved proposals to approved with amounts populated', function () {
    $migration = require database_path('migrations/2026_10_20_000001_add_approved_and_recommendation_fields_to_needs_table.php');

    $id = insertTestNeed([
        'title' => 'Historical Approved Need',
        'volume' => 10.0000,
        'unit_price' => 50000.00,
        'total_price' => 500000.00,
        'status' => 'draft',
        'approved_by_director_at' => now(),
        'approved_volume' => null,
        'approved_unit_price' => null,
        'approved_total_price' => null,
        'is_recommended_for_next_cycle' => false,
    ]);

    $migration->backfill();

    $record = DB::table('needs')->where('id', $id)->first();

    expect($record->status)->toBe('approved')
        ->and((float) $record->approved_volume)->toBe(10.0)
        ->and((float) $record->approved_unit_price)->toBe(50000.0)
        ->and((float) $record->approved_total_price)->toBe(500000.0);
});

test('migration backfill preserves existing approved figures without overwriting', function () {
    $migration = require database_path('migrations/2026_10_20_000001_add_approved_and_recommendation_fields_to_needs_table.php');

    $id = insertTestNeed([
        'title' => 'Partially Approved Need',
        'volume' => 10.0000,
        'unit_price' => 50000.00,
        'total_price' => 500000.00,
        'status' => 'approved',
        'approved_by_director_at' => now(),
        'approved_volume' => 6.0000,
        'approved_unit_price' => 45000.00,
        'approved_total_price' => 270000.00,
        'is_recommended_for_next_cycle' => true,
        'recommended_volume' => 4.0000,
    ]);

    $migration->backfill();

    $record = DB::table('needs')->where('id', $id)->first();

    expect($record->status)->toBe('approved')
        ->and((float) $record->approved_volume)->toBe(6.0)
        ->and((float) $record->approved_unit_price)->toBe(45000.0)
        ->and((float) $record->approved_total_price)->toBe(270000.0)
        ->and((float) $record->recommended_volume)->toBe(4.0);
});

test('migration backfill transitions legacy unreviewed proposals previously marked approved to submitted', function () {
    $migration = require database_path('migrations/2026_10_20_000001_add_approved_and_recommendation_fields_to_needs_table.php');

    $id = insertTestNeed([
        'title' => 'Legacy Submitted Need',
        'volume' => 5.0000,
        'unit_price' => 10000.00,
        'total_price' => 50000.00,
        'status' => 'approved',
        'approved_by_director_at' => null,
    ]);

    $migration->backfill();

    $record = DB::table('needs')->where('id', $id)->first();

    expect($record->status)->toBe('submitted');
});

test('migration backfill transitions unapproved proposals with non-empty review notes to revision', function () {
    $migration = require database_path('migrations/2026_10_20_000001_add_approved_and_recommendation_fields_to_needs_table.php');

    $idWithNotes = insertTestNeed([
        'title' => 'Need With Revision Notes',
        'volume' => 3.0000,
        'unit_price' => 25000.00,
        'total_price' => 75000.00,
        'status' => 'draft',
        'notes' => 'Perbaiki spesifikasi RAM minimal 16GB.',
        'approved_by_director_at' => null,
    ]);

    $idWithBlankNotes = insertTestNeed([
        'title' => 'Need With Blank Notes',
        'volume' => 1.0000,
        'unit_price' => 10000.00,
        'total_price' => 10000.00,
        'status' => 'draft',
        'notes' => '   ',
        'approved_by_director_at' => null,
    ]);

    $idWithNullNotes = insertTestNeed([
        'title' => 'Need With Null Notes',
        'volume' => 1.0000,
        'unit_price' => 10000.00,
        'total_price' => 10000.00,
        'status' => 'draft',
        'notes' => null,
        'approved_by_director_at' => null,
    ]);

    $idLegacyApprovedWithNotes = insertTestNeed([
        'title' => 'Legacy Approved Need With Notes',
        'volume' => 2.0000,
        'unit_price' => 15000.00,
        'total_price' => 30000.00,
        'status' => 'approved',
        'notes' => 'Harap lampirkan spesifikasi teknis.',
        'approved_by_director_at' => null,
    ]);

    $migration->backfill();

    expect(DB::table('needs')->where('id', $idWithNotes)->value('status'))->toBe('revision')
        ->and(DB::table('needs')->where('id', $idLegacyApprovedWithNotes)->value('status'))->toBe('revision')
        ->and(DB::table('needs')->where('id', $idWithBlankNotes)->value('status'))->toBe('draft')
        ->and(DB::table('needs')->where('id', $idWithNullNotes)->value('status'))->toBe('draft');
});

test('migration backfill is fully idempotent on multiple runs', function () {
    $migration = require database_path('migrations/2026_10_20_000001_add_approved_and_recommendation_fields_to_needs_table.php');

    $approvedId = insertTestNeed([
        'title' => 'Approved',
        'volume' => 5.0,
        'unit_price' => 100.0,
        'total_price' => 500.0,
        'status' => 'draft',
        'approved_by_director_at' => now(),
    ]);

    $submittedId = insertTestNeed([
        'title' => 'Submitted',
        'volume' => 2.0,
        'unit_price' => 200.0,
        'total_price' => 400.0,
        'status' => 'approved',
        'approved_by_director_at' => null,
    ]);

    $revisionId = insertTestNeed([
        'title' => 'Revision',
        'volume' => 1.0,
        'unit_price' => 300.0,
        'total_price' => 300.0,
        'status' => 'draft',
        'notes' => 'Tolong revisi',
        'approved_by_director_at' => null,
    ]);

    // First run
    $migration->backfill();

    $firstState = [
        DB::table('needs')->where('id', $approvedId)->first(),
        DB::table('needs')->where('id', $submittedId)->first(),
        DB::table('needs')->where('id', $revisionId)->first(),
    ];

    // Second run
    $migration->backfill();

    $secondState = [
        DB::table('needs')->where('id', $approvedId)->first(),
        DB::table('needs')->where('id', $submittedId)->first(),
        DB::table('needs')->where('id', $revisionId)->first(),
    ];

    expect($secondState)->toEqual($firstState);
});

test('migration rollback reverses status transformations and drops columns', function () {
    $migration = require database_path('migrations/2026_10_20_000001_add_approved_and_recommendation_fields_to_needs_table.php');

    $submittedId = insertTestNeed([
        'title' => 'Submitted Need',
        'volume' => 2.0,
        'unit_price' => 200.0,
        'total_price' => 400.0,
        'status' => 'submitted',
    ]);

    $revisionId = insertTestNeed([
        'title' => 'Revision Need',
        'volume' => 1.0,
        'unit_price' => 300.0,
        'total_price' => 300.0,
        'status' => 'revision',
        'notes' => 'Perbaiki',
    ]);
    // Down reverses backfill and drops columns
    $migration->down();

    expect(DB::table('needs')->where('id', $submittedId)->value('status'))->toBe('approved')
        ->and(DB::table('needs')->where('id', $revisionId)->value('status'))->toBe('draft')
        ->and(Schema::hasIndex('needs', 'idx_needs_group_recommended'))->toBeFalse()
        ->and(Schema::hasColumns('needs', [
            'approved_volume',
            'approved_unit_price',
            'approved_total_price',
            'is_recommended_for_next_cycle',
            'recommended_volume',
        ]))->toBeFalse();

    // Re-run up() to restore schema for subsequent tests
    $migration->up();

    expect(Schema::hasIndex('needs', 'idx_needs_group_recommended'))->toBeTrue()
        ->and(Schema::hasColumns('needs', [
            'approved_volume',
            'approved_unit_price',
            'approved_total_price',
            'is_recommended_for_next_cycle',
            'recommended_volume',
        ]))->toBeTrue();
});
