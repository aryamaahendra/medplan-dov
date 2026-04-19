<?php

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
});

test('index can filter needs by director approval status', function () {
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    // Approved
    Need::factory()->create([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
        'approved_by_director_at' => now(),
    ]);

    // Pending
    Need::factory()->create([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
        'approved_by_director_at' => null,
    ]);

    // Filter for approved
    $this->actingAs($this->user)
        ->get(route('needs.index', ['need_group_id' => $group->id, 'is_approved_by_director' => ['1']]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 1)
            ->where('needs.data.0.approved_by_director_at', fn ($val) => ! is_null($val))
        );

    // Filter for pending
    $this->actingAs($this->user)
        ->get(route('needs.index', ['need_group_id' => $group->id, 'is_approved_by_director' => ['0']]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 1)
            ->where('needs.data.0.approved_by_director_at', null)
        );
});

test('index can filter needs by checklist score', function () {
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    // Score 90%
    Need::factory()->create([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
        'checklist_percentage' => 90,
    ]);

    // Score 80%
    Need::factory()->create([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
        'checklist_percentage' => 80,
    ]);

    // Filter for >= 85%
    $this->actingAs($this->user)
        ->get(route('needs.index', ['need_group_id' => $group->id, 'min_checklist_score' => ['85']]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 1)
            ->where('needs.data.0.checklist_percentage', '90.00')
        );
});
