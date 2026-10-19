<?php

declare(strict_types=1);

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->orgUnit = OrganizationalUnit::factory()->create(['name' => 'IT Department']);

    $this->directorUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->directorUser->assignRole('director');

    $this->staffUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->staffUser->assignRole('staff');

    $this->needGroup = NeedGroup::factory()->create([
        'is_active' => true,
        'submission_start_at' => now()->subDays(5),
        'submission_end_at' => now()->addDays(5),
    ]);

    $this->needType = NeedType::factory()->create();
});

describe('UpdateDirectorReviewRequest validation', function () {
    it('validates decision is required and in approved, rejected, revision', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->needGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
        ]);

        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [])
            ->assertSessionHasErrors(['decision']);

        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => 'invalid_decision',
            ])
            ->assertSessionHasErrors(['decision']);
    });

    it('requires notes when decision is revision', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->needGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
        ]);

        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_REVISION,
                'notes' => '',
            ])
            ->assertSessionHasErrors(['notes']);

        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_REVISION,
                'notes' => 'Tolong perbaiki spesifikasi teknis dan rincian anggaran.',
            ])
            ->assertSessionHasNoErrors();
    });

    it('validates approved volume and unit price when decision is approved', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->needGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 10,
            'unit_price' => 100000,
            'total_price' => 1000000,
        ]);

        // Missing approved_volume and approved_unit_price
        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_APPROVED,
            ])
            ->assertSessionHasErrors(['approved_volume', 'approved_unit_price']);

        // Non-positive volume and unit price
        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 0,
                'approved_unit_price' => -500,
            ])
            ->assertSessionHasErrors(['approved_volume', 'approved_unit_price']);

        // Volume exceeds requested volume
        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 12,
                'approved_unit_price' => 100000,
            ])
            ->assertSessionHasErrors(['approved_volume']);

        // Valid approved values
        $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 8,
                'approved_unit_price' => 95000,
            ])
            ->assertSessionHasNoErrors();
    });
});

describe('Director Review executive decision transitions', function () {
    it('sets status to approved, stamps approval timestamp, computes total price, and freezes proposal on full approval', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->needGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 10,
            'unit_price' => 50000,
            'total_price' => 500000,
            'is_locked' => true,
        ]);

        $response = $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 10,
                'approved_unit_price' => 50000,
                'notes' => 'Disetujui penuh',
                'is_recommended_for_next_cycle' => false,
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();

        expect($freshNeed->status)->toBe(Need::STATUS_APPROVED)
            ->and($freshNeed->approved_by_director_at)->not->toBeNull()
            ->and((float) $freshNeed->approved_volume)->toBe(10.0)
            ->and((float) $freshNeed->approved_unit_price)->toBe(50000.0)
            ->and((float) $freshNeed->approved_total_price)->toBe(500000.0)
            ->and($freshNeed->is_locked)->toBeTrue()
            ->and($freshNeed->locked_by_user_id)->toBe($this->directorUser->id)
            ->and($freshNeed->is_recommended_for_next_cycle)->toBeFalse()
            ->and($freshNeed->recommended_volume)->toBeNull();
    });

    it('calculates residual volume and stores as recommended volume on partial approval with recommendation flag', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->needGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 10,
            'unit_price' => 50000,
            'total_price' => 500000,
        ]);

        $response = $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 6,
                'approved_unit_price' => 45000,
                'notes' => 'Disetujui sebagian, sisa diusulkan siklus berikutnya',
                'is_recommended_for_next_cycle' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();

        expect($freshNeed->status)->toBe(Need::STATUS_APPROVED)
            ->and((float) $freshNeed->approved_volume)->toBe(6.0)
            ->and((float) $freshNeed->approved_unit_price)->toBe(45000.0)
            ->and((float) $freshNeed->approved_total_price)->toBe(270000.0)
            ->and($freshNeed->is_recommended_for_next_cycle)->toBeTrue()
            ->and((float) $freshNeed->recommended_volume)->toBe(4.0)
            ->and($freshNeed->is_locked)->toBeTrue();
    });

    it('sets status to rejected, clears approval timestamp, records full volume if recommended, and freezes proposal on rejection', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->needGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 8,
            'unit_price' => 25000,
            'total_price' => 200000,
            'approved_by_director_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_REJECTED,
                'notes' => 'Plafon anggaran tahun ini habis, rekomendasikan siklus depan',
                'is_recommended_for_next_cycle' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();

        expect($freshNeed->status)->toBe(Need::STATUS_REJECTED)
            ->and($freshNeed->approved_by_director_at)->toBeNull()
            ->and($freshNeed->approved_volume)->toBeNull()
            ->and($freshNeed->approved_unit_price)->toBeNull()
            ->and($freshNeed->approved_total_price)->toBeNull()
            ->and($freshNeed->is_recommended_for_next_cycle)->toBeTrue()
            ->and((float) $freshNeed->recommended_volume)->toBe(8.0)
            ->and($freshNeed->is_locked)->toBeTrue();
    });

    it('sets status to revision, clears approval timestamp, records mandatory notes, and unlocks proposal for submitter', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->needGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 5,
            'unit_price' => 20000,
            'is_locked' => true,
            'lock_reason' => 'Usulan sedang dalam proses review eksekutif.',
            'approved_by_director_at' => now()->subDay(),
            'is_recommended_for_next_cycle' => true,
            'recommended_volume' => 5,
        ]);

        $response = $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_REVISION,
                'notes' => 'Rasionalisasi kembali jumlah kebutuhan sesuai beban kerja.',
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();

        expect($freshNeed->status)->toBe(Need::STATUS_REVISION)
            ->and($freshNeed->approved_by_director_at)->toBeNull()
            ->and($freshNeed->notes)->toBe('Rasionalisasi kembali jumlah kebutuhan sesuai beban kerja.')
            ->and($freshNeed->is_recommended_for_next_cycle)->toBeFalse()
            ->and($freshNeed->recommended_volume)->toBeNull()
            ->and($freshNeed->is_locked)->toBeNull()
            ->and($freshNeed->isLocked($this->staffUser))->toBeFalse();
    });

    it('handles decimal volume adjustments and calculates fractional residual correctly', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->needGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 12.5,
            'unit_price' => 15500.50,
            'total_price' => 193756.25,
        ]);

        $response = $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 7.25,
                'approved_unit_price' => 15000.00,
                'is_recommended_for_next_cycle' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();

        expect((float) $freshNeed->approved_volume)->toBe(7.25)
            ->and((float) $freshNeed->approved_unit_price)->toBe(15000.0)
            ->and((float) $freshNeed->approved_total_price)->toBe(108750.0)
            ->and($freshNeed->is_recommended_for_next_cycle)->toBeTrue()
            ->and((float) $freshNeed->recommended_volume)->toBe(5.25);
    });

    it('does not store residual recommendation when full volume is approved even if recommendation flag is sent', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->needGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'status' => Need::STATUS_SUBMITTED,
            'volume' => 10,
            'unit_price' => 20000,
        ]);

        $response = $this->actingAs($this->directorUser)
            ->patch(route('needs.director-review', $need), [
                'decision' => Need::STATUS_APPROVED,
                'approved_volume' => 10,
                'approved_unit_price' => 20000,
                'is_recommended_for_next_cycle' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $freshNeed = $need->fresh();

        expect($freshNeed->is_recommended_for_next_cycle)->toBeFalse()
            ->and($freshNeed->recommended_volume)->toBeNull();
    });
});
