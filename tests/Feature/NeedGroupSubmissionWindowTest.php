<?php

use App\Enums\Impact;
use App\Enums\Urgency;
use App\Enums\UserRole;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);

    $this->orgUnit = OrganizationalUnit::factory()->create();

    $this->staffUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->staffUser->assignRole(UserRole::Staff->value);

    $this->plannerUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->plannerUser->assignRole(UserRole::Planner->value);

    $this->superAdminUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->superAdminUser->assignRole(UserRole::SuperAdmin->value);

    $this->needType = NeedType::factory()->create(['is_active' => true]);
});

describe('NeedGroup isOpenForSubmission helper', function () {
    it('returns true when active and boundaries are null', function () {
        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => null,
            'submission_end_at' => null,
        ]);

        expect($group->isOpenForSubmission())->toBeTrue();
    });

    it('returns false when group is inactive regardless of timestamps', function () {
        $group = NeedGroup::factory()->create([
            'is_active' => false,
            'submission_start_at' => now()->subDay(),
            'submission_end_at' => now()->addDay(),
        ]);

        expect($group->isOpenForSubmission())->toBeFalse();
    });

    it('returns true when current time is strictly within start and end boundaries', function () {
        $this->travelTo('2026-06-15 12:00:00');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        expect($group->isOpenForSubmission())->toBeTrue();

        $this->travelBack();
    });

    it('returns false before submission start date', function () {
        $this->travelTo('2026-05-31 23:59:59');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        expect($group->isOpenForSubmission())->toBeFalse();

        $this->travelBack();
    });

    it('returns false after submission deadline', function () {
        $this->travelTo('2026-07-01 00:00:01');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        expect($group->isOpenForSubmission())->toBeFalse();

        $this->travelBack();
    });

    it('handles open-ended start or end dates correctly', function () {
        $this->travelTo('2026-06-15 12:00:00');

        $groupOnlyStart = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => null,
        ]);
        expect($groupOnlyStart->isOpenForSubmission())->toBeTrue();

        $groupOnlyEnd = NeedGroup::factory()->create([
            'is_active' => true,
            'submission_start_at' => null,
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);
        expect($groupOnlyEnd->isOpenForSubmission())->toBeTrue();

        $this->travelTo('2026-07-01 00:00:00');
        expect($groupOnlyEnd->isOpenForSubmission())->toBeFalse();

        $this->travelBack();
    });
});

describe('Need submission window authorization', function () {
    it('allows staff to create a need during an open window', function () {
        $this->travelTo('2026-06-15 12:00:00');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'year' => 2026,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        $payload = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Open Window Need',
            'description' => 'Test Desc',
            'volume' => 1,
            'unit' => 'unit',
            'unit_price' => 1000,
            'total_price' => 1000,
            'urgency' => Urgency::Low->value,
            'impact' => Impact::Low->value,
            'is_priority' => false,
        ];

        $response = $this->actingAs($this->staffUser)
            ->post(route('needs.store'), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('needs', [
            'title' => 'Open Window Need',
            'need_group_id' => $group->id,
        ]);

        $this->travelBack();
    });

    it('blocks staff from creating a need when submission window is closed (403)', function () {
        $this->travelTo('2026-07-01 12:00:00');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'year' => 2026,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        $payload = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Closed Window Need',
            'description' => 'Test Desc',
            'volume' => 1,
            'unit' => 'unit',
            'unit_price' => 1000,
            'total_price' => 1000,
            'urgency' => Urgency::Low->value,
            'impact' => Impact::Low->value,
            'is_priority' => false,
        ];

        $response = $this->actingAs($this->staffUser)
            ->post(route('needs.store'), $payload);

        $response->assertForbidden();
        $this->assertDatabaseMissing('needs', [
            'title' => 'Closed Window Need',
        ]);
        $response->assertSee('Periode pengajuan usulan kebutuhan untuk kelompok ini sedang ditutup.');

        $this->travelBack();
    });

    it('blocks staff from creating a need before submission window start date (403)', function () {
        $this->travelTo('2026-05-31 23:59:59');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'year' => 2026,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        $payload = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Before Start Window Need',
            'description' => 'Test Desc',
            'volume' => 1,
            'unit' => 'unit',
            'unit_price' => 1000,
            'total_price' => 1000,
            'urgency' => Urgency::Low->value,
            'impact' => Impact::Low->value,
            'is_priority' => false,
        ];

        $response = $this->actingAs($this->staffUser)
            ->post(route('needs.store'), $payload);

        $response->assertForbidden();
        $response->assertSee('Periode pengajuan usulan kebutuhan untuk kelompok ini sedang ditutup.');
        $this->assertDatabaseMissing('needs', [
            'title' => 'Before Start Window Need',
        ]);

        $this->travelBack();
    });

    it('blocks staff from creating a need when need group is inactive (403)', function () {
        $group = NeedGroup::factory()->create([
            'is_active' => false,
            'year' => 2026,
        ]);

        $payload = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Inactive Group Need',
            'description' => 'Test Desc',
            'volume' => 1,
            'unit' => 'unit',
            'unit_price' => 1000,
            'total_price' => 1000,
            'urgency' => Urgency::Low->value,
            'impact' => Impact::Low->value,
            'is_priority' => false,
        ];

        $response = $this->actingAs($this->staffUser)
            ->post(route('needs.store'), $payload);

        $response->assertForbidden();
        $response->assertSee('Periode pengajuan usulan kebutuhan untuk kelompok ini sedang ditutup.');
        $this->assertDatabaseMissing('needs', [
            'title' => 'Inactive Group Need',
        ]);
    });

    it('allows planner and super-admin to bypass closed submission window on create', function () {
        $this->travelTo('2026-07-01 12:00:00');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'year' => 2026,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        $payloadPlanner = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Planner Bypassed Need',
            'description' => 'Test Desc',
            'volume' => 1,
            'unit' => 'unit',
            'unit_price' => 1000,
            'total_price' => 1000,
            'urgency' => Urgency::Low->value,
            'impact' => Impact::Low->value,
            'is_priority' => false,
        ];

        $responsePlanner = $this->actingAs($this->plannerUser)
            ->post(route('needs.store'), $payloadPlanner);

        $responsePlanner->assertRedirect();
        $this->assertDatabaseHas('needs', [
            'title' => 'Planner Bypassed Need',
        ]);

        $payloadAdmin = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Super Admin Bypassed Need',
            'description' => 'Test Desc',
            'volume' => 1,
            'unit' => 'unit',
            'unit_price' => 1000,
            'total_price' => 1000,
            'urgency' => Urgency::Low->value,
            'impact' => Impact::Low->value,
            'is_priority' => false,
        ];

        $responseAdmin = $this->actingAs($this->superAdminUser)
            ->post(route('needs.store'), $payloadAdmin);

        $responseAdmin->assertRedirect();
        $this->assertDatabaseHas('needs', [
            'title' => 'Super Admin Bypassed Need',
        ]);

        $this->travelBack();
    });

    it('allows staff to edit a need during open submission window', function () {
        $this->travelTo('2026-06-15 12:00:00');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'year' => 2026,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Initial Title',
            'volume' => 1,
            'unit_price' => 1000,
            'total_price' => 1000,
        ]);

        $updatePayload = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Updated Title',
            'unit' => 'unit',
            'volume' => 1,
            'unit_price' => 1000,
            'total_price' => 1000,
        ];

        $response = $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), $updatePayload);

        $response->assertRedirect();
        expect($need->refresh()->title)->toBe('Updated Title');

        $this->travelBack();
    });

    it('blocks staff from editing a need when submission window is closed (403)', function () {
        $this->travelTo('2026-07-01 12:00:00');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'year' => 2026,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Initial Title',
            'volume' => 1,
            'unit_price' => 1000,
            'total_price' => 1000,
        ]);

        $updatePayload = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Should Not Update',
            'unit' => 'unit',
            'volume' => 1,
            'unit_price' => 1000,
            'total_price' => 1000,
        ];

        $response = $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), $updatePayload);
        $response->assertForbidden();
        $response->assertSee('Periode pengajuan usulan kebutuhan untuk kelompok ini sedang ditutup.');
        expect($need->refresh()->title)->toBe('Initial Title');

        $this->travelBack();
    });

    it('blocks staff from editing a need before submission window start date (403)', function () {
        $this->travelTo('2026-05-31 23:59:59');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'year' => 2026,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Initial Title',
            'volume' => 1,
            'unit_price' => 1000,
            'total_price' => 1000,
        ]);

        $updatePayload = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Should Not Update Before Start',
            'unit' => 'unit',
            'volume' => 1,
            'unit_price' => 1000,
            'total_price' => 1000,
        ];

        $response = $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), $updatePayload);

        $response->assertForbidden();
        $response->assertSee('Periode pengajuan usulan kebutuhan untuk kelompok ini sedang ditutup.');
        expect($need->refresh()->title)->toBe('Initial Title');

        $this->travelBack();
    });

    it('blocks staff from editing a need when need group is inactive (403)', function () {
        $group = NeedGroup::factory()->create([
            'is_active' => false,
            'year' => 2026,
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Initial Title',
            'volume' => 1,
            'unit_price' => 1000,
            'total_price' => 1000,
        ]);

        $updatePayload = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Should Not Update Inactive',
            'unit' => 'unit',
            'volume' => 1,
            'unit_price' => 1000,
            'total_price' => 1000,
        ];

        $response = $this->actingAs($this->staffUser)
            ->patch(route('needs.update', $need), $updatePayload);

        $response->assertForbidden();
        $response->assertSee('Periode pengajuan usulan kebutuhan untuk kelompok ini sedang ditutup.');
        expect($need->refresh()->title)->toBe('Initial Title');
    });

    it('allows planner and super-admin to edit a need when submission window is closed', function () {
        $this->travelTo('2026-07-01 12:00:00');

        $group = NeedGroup::factory()->create([
            'is_active' => true,
            'year' => 2026,
            'submission_start_at' => '2026-06-01 00:00:00',
            'submission_end_at' => '2026-06-30 23:59:59',
        ]);

        $need = Need::factory()->create([
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Initial Title',
            'volume' => 1,
            'unit_price' => 1000,
            'total_price' => 1000,
        ]);

        $updatePayload = [
            'need_group_id' => $group->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'year' => 2026,
            'title' => 'Planner Updated',
            'unit' => 'unit',
            'volume' => 1,
            'unit_price' => 1000,
            'total_price' => 1000,
            'urgency' => Urgency::Low->value,
            'impact' => Impact::Low->value,
        ];

        $response = $this->actingAs($this->plannerUser)
            ->patch(route('needs.update', $need), $updatePayload);

        $response->assertRedirect();
        expect($need->refresh()->title)->toBe('Planner Updated');

        $this->travelBack();
    });
});
