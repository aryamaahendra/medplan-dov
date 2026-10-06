<?php

use App\Enums\UserRole;
use App\Http\Resources\NeedResource;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Inertia\Testing\AssertableInertia as Assert;
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

    $this->directorUser = User::factory()->create([
        'organizational_unit_id' => $this->orgUnit->id,
    ]);
    $this->directorUser->assignRole(UserRole::Director->value);

    $this->needType = NeedType::factory()->create(['is_active' => true]);

    $this->openGroup = NeedGroup::factory()->create([
        'is_active' => true,
        'submission_start_at' => now()->subDays(5),
        'submission_end_at' => now()->addDays(5),
    ]);

    $this->closedGroup = NeedGroup::factory()->create([
        'is_active' => true,
        'submission_start_at' => now()->subDays(10),
        'submission_end_at' => now()->subDay(),
    ]);

    $this->upcomingGroup = NeedGroup::factory()->create([
        'is_active' => true,
        'submission_start_at' => now()->addDays(2),
        'submission_end_at' => now()->addDays(10),
    ]);

    $this->indefiniteGroup = NeedGroup::factory()->create([
        'is_active' => true,
        'submission_start_at' => null,
        'submission_end_at' => null,
    ]);
});

describe('NeedGroup submission_window_status', function () {
    it('determines status correctly', function () {
        expect($this->openGroup->getSubmissionWindowStatus())->toBe('open')
            ->and($this->closedGroup->getSubmissionWindowStatus())->toBe('closed')
            ->and($this->upcomingGroup->getSubmissionWindowStatus())->toBe('upcoming')
            ->and($this->indefiniteGroup->getSubmissionWindowStatus())->toBe('indefinite');
    });
});

describe('NeedResource lock metadata serialization', function () {
    it('serializes composite lock fields for a locked need', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'is_locked' => null,
            'lock_reason' => null,
        ]);

        $request = Request::create('/');
        $request->setUserResolver(fn () => $this->staffUser);

        $resource = NeedResource::make($need)->toArray($request);

        expect($resource)->toHaveKeys([
            'is_locked',
            'lock_reason',
            'unlocked_until',
            'submission_window_status',
            'can',
        ]);
        expect($resource['is_locked'])->toBeTrue()
            ->and($resource['submission_window_status'])->toBe('closed')
            ->and($resource['lock_reason'])->toBe('Periode pengajuan usulan kebutuhan untuk kelompok ini telah ditutup.')
            ->and($resource['can']['update'])->toBeFalse()
            ->and($resource['can']['lock'])->toBeFalse()
            ->and($resource['can']['unlock'])->toBeFalse();
    });

    it('serializes manual lock reason when explicitly locked', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'is_locked' => true,
            'lock_reason' => 'Dikunci untuk audit perencanaan.',
        ]);

        $request = Request::create('/');
        $request->setUserResolver(fn () => $this->staffUser);

        $resource = NeedResource::make($need)->toArray($request);

        expect($resource['is_locked'])->toBeTrue()
            ->and($resource['lock_reason'])->toBe('Dikunci untuk audit perencanaan.')
            ->and($resource['submission_window_status'])->toBe('open');
    });

    it('serializes upcoming submission window reason when intake has not started', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->upcomingGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'is_locked' => null,
            'lock_reason' => null,
        ]);

        $request = Request::create('/');
        $request->setUserResolver(fn () => $this->staffUser);

        $resource = NeedResource::make($need)->toArray($request);

        expect($resource['is_locked'])->toBeTrue()
            ->and($resource['lock_reason'])->toBe('Periode pengajuan usulan kebutuhan untuk kelompok ini belum dibuka.')
            ->and($resource['submission_window_status'])->toBe('upcoming');
    });

    it('serializes director approval lock reason when approved', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'approved_by_director_at' => now(),
            'lock_reason' => null,
        ]);

        $request = Request::create('/');
        $request->setUserResolver(fn () => $this->staffUser);

        $resource = NeedResource::make($need)->toArray($request);

        expect($resource['is_locked'])->toBeTrue()
            ->and($resource['lock_reason'])->toBe('Usulan telah disetujui oleh Direktur.')
            ->and($resource['submission_window_status'])->toBe('open');
    });

    it('serializes active extension and unlocked status', function () {
        $extension = now()->addDays(2);
        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'unlocked_until' => $extension,
            'lock_reason' => 'Perpanjangan revisi TOR',
        ]);

        $request = Request::create('/');
        $request->setUserResolver(fn () => $this->staffUser);

        $resource = NeedResource::make($need)->toArray($request);

        expect($resource['is_locked'])->toBeFalse()
            ->and($resource['unlocked_until'])->not->toBeNull()
            ->and($resource['lock_reason'])->toBe('Perpanjangan revisi TOR')
            ->and($resource['submission_window_status'])->toBe('closed')
            ->and($resource['can']['update'])->toBeTrue();
    });

    it('provides lock permissions to planner', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
        ]);

        $request = Request::create('/');
        $request->setUserResolver(fn () => $this->plannerUser);

        $resource = NeedResource::make($need)->toArray($request);

        expect($resource['can']['lock'])->toBeTrue()
            ->and($resource['can']['unlock'])->toBeTrue()
            ->and($resource['can']['performChecklist'])->toBeTrue();
    });
});

describe('Inertia response contains lock metadata', function () {
    it('supplies lock metadata on needs show view', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'approved_by_director_at' => now(),
        ]);

        $response = $this->actingAs($this->staffUser)
            ->get(route('needs.show', $need));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/show')
                ->has('need')
                ->where('need.is_locked', true)
                ->where('need.lock_reason', 'Usulan telah disetujui oleh Direktur.')
                ->where('need.submission_window_status', 'closed')
                ->where('need.can.update', false)
            );
    });

    it('supplies lock metadata and permissions on needs index view', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'is_locked' => true,
            'lock_reason' => 'Manually locked for evaluation',
        ]);

        $response = $this->actingAs($this->plannerUser)
            ->get(route('needs.index', ['need_group_id' => $this->openGroup->id]));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/index')
                ->has('needs.data', 1)
                ->where('needs.data.0.is_locked', true)
                ->where('needs.data.0.lock_reason', 'Manually locked for evaluation')
                ->where('needs.data.0.can.lock', true)
                ->where('needs.data.0.can.unlock', true)
            );
    });
    it('supplies objective lock status and unlock permission to super admin on locked need', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'is_locked' => true,
            'lock_reason' => 'Manually locked for evaluation',
        ]);
        $superAdminUser = User::factory()->create([
            'organizational_unit_id' => $this->orgUnit->id,
        ]);
        $superAdminUser->assignRole(UserRole::SuperAdmin->value);

        $response = $this->actingAs($superAdminUser)
            ->get(route('needs.index', ['need_group_id' => $this->openGroup->id]));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/index')
                ->has('needs.data', 1)
                ->where('needs.data.0.is_locked', true)
                ->where('needs.data.0.lock_reason', 'Manually locked for evaluation')
                ->where('needs.data.0.can.lock', true)
                ->where('needs.data.0.can.unlock', true)
                ->where('needs.data.0.can.update', true)
            );
    });

    it('supplies lock metadata on needs edit view when accessed by authorized user', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->openGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'is_locked' => false,
        ]);

        $response = $this->actingAs($this->staffUser)
            ->get(route('needs.edit', $need));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/edit')
                ->has('need')
                ->where('need.is_locked', false)
                ->where('need.submission_window_status', 'open')
                ->where('need.can.update', true)
            );
    });

    it('allows submitters to view locked edit page with disabled state metadata', function () {
        $need = Need::factory()->create([
            'need_group_id' => $this->closedGroup->id,
            'organizational_unit_id' => $this->orgUnit->id,
            'need_type_id' => $this->needType->id,
            'is_locked' => null,
        ]);

        $response = $this->actingAs($this->staffUser)
            ->get(route('needs.edit', $need));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('need/needs/edit')
                ->has('need')
                ->where('need.is_locked', true)
                ->where('need.can.update', false)
                ->where('need.submission_window_status', 'closed')
            );
    });
});
