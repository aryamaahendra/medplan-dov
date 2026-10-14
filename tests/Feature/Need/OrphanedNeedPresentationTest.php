<?php

use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\Sasaran;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super-admin');
    $this->group = NeedGroup::factory()->create(['is_active' => true]);
    $this->needType = NeedType::factory()->create(['is_active' => true]);
});

test('proposals referencing soft-deleted units continue to be returned in unfiltered list with null organizationalUnit', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);
    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif']);

    $orphanedNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Unit Terhapus',
    ]);

    $activeNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $activeUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Unit Aktif',
    ]);

    $trashedUnit->delete();

    $response = $this->actingAs($this->superAdmin)
        ->get(route('needs.index', ['need_group_id' => $this->group->id]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 2)
            ->where('needs.data.0.organizational_unit', null)
        );

    expect($orphanedNeed->fresh()->organizationalUnit)->toBeNull();
});

test('GetFilteredNeedsAction filters orphaned proposals when organizational_unit_id contains trashed', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);
    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif']);

    $orphanedNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Unit Terhapus',
    ]);

    $activeNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $activeUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Unit Aktif',
    ]);

    $trashedUnit->delete();

    $response = $this->actingAs($this->superAdmin)
        ->get(route('needs.index', [
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => ['trashed'],
        ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 1)
            ->where('needs.data.0.id', $orphanedNeed->id)
            ->where('needs.data.0.organizational_unit', null)
        );
});

test('active unit choices provided in NeedController index strictly exclude trashed units', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);
    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif']);

    $trashedUnit->delete();

    $response = $this->actingAs($this->superAdmin)
        ->get(route('needs.index', ['need_group_id' => $this->group->id]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('organizationalUnits', 1)
            ->where('organizationalUnits.0.id', $activeUnit->id)
        );
});

test('StoreNeedRequest rejects soft-deleted organizational_unit_id', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);
    $trashedUnit->delete();

    $sasaran = Sasaran::factory()->create();

    $payload = [
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'year' => 2025,
        'title' => 'Pengadaan Laptop Baru',
        'volume' => 1,
        'unit' => 'unit',
        'unit_price' => 10000000,
        'total_price' => 10000000,
        'urgency' => 'medium',
        'impact' => 'medium',
        'sasaran_ids' => [$sasaran->id],
    ];

    $response = $this->actingAs($this->superAdmin)
        ->post(route('needs.store'), $payload);

    $response->assertSessionHasErrors(['organizational_unit_id']);
    expect(Need::where('title', 'Pengadaan Laptop Baru')->exists())->toBeFalse();
});

test('UpdateNeedRequest rejects soft-deleted organizational_unit_id', function () {
    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif']);
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);

    $need = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $activeUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Awal',
    ]);

    $trashedUnit->delete();

    $payload = [
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'year' => 2025,
        'title' => 'Usulan Diperbarui',
        'volume' => 1,
        'unit' => 'unit',
        'unit_price' => 10000000,
        'total_price' => 10000000,
        'urgency' => 'medium',
        'impact' => 'medium',
    ];

    $response = $this->actingAs($this->superAdmin)
        ->put(route('needs.update', $need), $payload);

    $response->assertSessionHasErrors(['organizational_unit_id']);
    expect($need->fresh()->title)->toBe('Usulan Awal');
});

test('users assigned to soft-deleted unit cannot create new needs under that inactive unit', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Nonaktif']);

    $staff = User::factory()->create(['organizational_unit_id' => $trashedUnit->id]);
    $staff->assignRole('staff');

    $trashedUnit->delete();

    $sasaran = Sasaran::factory()->create();

    $payload = [
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'year' => 2025,
        'title' => 'Usulan dari Pegawai Unit Terhapus',
        'volume' => 1,
        'unit' => 'unit',
        'unit_price' => 10000000,
        'total_price' => 10000000,
        'urgency' => 'medium',
        'impact' => 'medium',
        'sasaran_ids' => [$sasaran->id],
    ];

    $response = $this->actingAs($staff)
        ->post(route('needs.store'), $payload);

    $response->assertSessionHasErrors(['organizational_unit_id']);
    expect(Need::where('title', 'Usulan dari Pegawai Unit Terhapus')->exists())->toBeFalse();
});

test('GetFilteredNeedsAction handles string trashed filter value', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);
    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif']);

    $orphanedNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Unit Terhapus',
    ]);

    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $activeUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Unit Aktif',
    ]);

    $trashedUnit->delete();

    $response = $this->actingAs($this->superAdmin)
        ->get(route('needs.index', [
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => 'trashed',
        ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 1)
            ->where('needs.data.0.id', $orphanedNeed->id)
        );
});

test('GetFilteredNeedsAction can combine trashed and active unit filters', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);
    $activeUnitA = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif A']);
    $activeUnitB = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif B']);

    $orphanedNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Terhapus',
    ]);

    $needA = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $activeUnitA->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan A',
    ]);

    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $activeUnitB->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan B',
    ]);

    $trashedUnit->delete();

    $response = $this->actingAs($this->superAdmin)
        ->get(route('needs.index', [
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => ['trashed', $activeUnitA->id],
        ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 2)
        );
});

test('filtering by active unit excludes orphaned proposals', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);
    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif']);

    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Unit Terhapus',
    ]);

    $activeNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $activeUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Unit Aktif',
    ]);

    $trashedUnit->delete();

    $response = $this->actingAs($this->superAdmin)
        ->get(route('needs.index', [
            'need_group_id' => $this->group->id,
            'organizational_unit_id' => [$activeUnit->id],
        ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 1)
            ->where('needs.data.0.id', $activeNeed->id)
        );
});

test('general proposal stage and attention counters accurately reflect proposals whose unit is soft-deleted', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);
    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif']);

    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'status' => 'draft',
        'is_priority' => true,
        'notes' => 'Catatan penting',
        'title' => 'Usulan Terhapus Prioritas',
    ]);

    Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $activeUnit->id,
        'need_type_id' => $this->needType->id,
        'status' => 'draft',
        'is_priority' => false,
        'title' => 'Usulan Aktif Biasa',
    ]);

    $trashedUnit->delete();

    $response = $this->actingAs($this->superAdmin)
        ->get(route('needs.index', ['need_group_id' => $this->group->id]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('stageCounts.all', 2)
            ->where('stageCounts.draft', 2)
            ->where('attentionCounts.priority_only', 1)
            ->where('attentionCounts.has_notes', 1)
        );
});

test('need show view delivers null organizational_unit and non-null organizational_unit_id for orphaned proposal', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Nonaktif']);
    $orphanedNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Detail Usulan Unit Nonaktif',
    ]);

    $trashedUnit->delete();

    $response = $this->actingAs($this->superAdmin)
        ->get(route('needs.show', $orphanedNeed));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('need/needs/show')
            ->where('need.id', $orphanedNeed->id)
            ->where('need.organizational_unit_id', $trashedUnit->id)
            ->where('need.organizational_unit', null)
        );
});

test('need edit view delivers null organizational_unit and only active units in organizationalUnits prop', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);
    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif']);

    $orphanedNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Edit Usulan Unit Terhapus',
    ]);

    $trashedUnit->delete();

    $response = $this->actingAs($this->superAdmin)
        ->get(route('needs.edit', $orphanedNeed));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('need/needs/edit')
            ->where('need.id', $orphanedNeed->id)
            ->where('need.organizational_unit_id', $trashedUnit->id)
            ->where('need.organizational_unit', null)
            ->has('organizationalUnits', fn (Assert $units) => $units
                ->each(fn (Assert $u) => $u->whereNot('id', $trashedUnit->id)->etc())
            )
        );
});

test('updating an orphaned proposal with a newly chosen active unit persists successfully and clears orphaned state', function () {
    $trashedUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Terhapus']);
    $activeUnit = OrganizationalUnit::factory()->create(['name' => 'Unit Aktif Baru']);

    $orphanedNeed = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $trashedUnit->id,
        'need_type_id' => $this->needType->id,
        'title' => 'Usulan Reassignment',
    ]);

    $trashedUnit->delete();

    $payload = [
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $activeUnit->id,
        'need_type_id' => $this->needType->id,
        'year' => 2025,
        'title' => 'Usulan Reassignment Selesai',
        'volume' => 1,
        'unit' => 'unit',
        'unit_price' => 10000000,
        'total_price' => 10000000,
        'urgency' => 'medium',
        'impact' => 'medium',
    ];

    $response = $this->actingAs($this->superAdmin)
        ->put(route('needs.update', $orphanedNeed), $payload);

    $response->assertRedirect(route('needs.index', ['need_group_id' => $this->group->id]));
    $response->assertSessionHas('success');

    $updated = $orphanedNeed->fresh();
    expect($updated->organizational_unit_id)->toBe($activeUnit->id)
        ->and($updated->organizationalUnit)->not->toBeNull()
        ->and($updated->organizationalUnit->name)->toBe('Unit Aktif Baru');
});
