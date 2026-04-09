<?php

use App\Enums\Impact;
use App\Enums\Urgency;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\Sasaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validNeedPayload(NeedGroup $group, OrganizationalUnit $unit, NeedType $needType, array $overrides = []): array
{
    $sasaran = Sasaran::factory()->create();

    return array_merge([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
        'year' => 2025,
        'title' => 'Pengadaan Komputer',
        'description' => 'Deskripsi pengadaan komputer.',
        'current_condition' => 'Komputer lama sudah usang.',
        'required_condition' => 'Perlu komputer baru.',
        'volume' => 5,
        'unit' => 'unit',
        'unit_price' => 10000000,
        'total_price' => 50000000,
        'urgency' => Urgency::Medium->value,
        'impact' => Impact::Medium->value,
        'is_priority' => false,
        'status' => 'draft',
        'sasaran_ids' => [$sasaran->id],
    ], $overrides);
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────

test('guest cannot access needs index', function () {
    $this->get(route('needs.index'))
        ->assertRedirect(route('login'));
});

// ─── Index ────────────────────────────────────────────────────────────────────

test('index renders the correct component and props', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();
    Need::factory()->count(3)->create([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
    ]);

    $this->actingAs($user)
        ->get(route('needs.index', ['need_group_id' => $group->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('needs/index')
            ->has('needs.data', 3)
            ->has('organizationalUnits')
            ->has('needTypes')
            ->has('filters')
        );
});

test('index can search needs by title', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    Need::factory()->create(['need_group_id' => $group->id, 'title' => 'Pengadaan Komputer', 'organizational_unit_id' => $unit->id, 'need_type_id' => $needType->id]);
    Need::factory()->create(['need_group_id' => $group->id, 'title' => 'Renovasi Gedung', 'organizational_unit_id' => $unit->id, 'need_type_id' => $needType->id]);

    $this->actingAs($user)
        ->get(route('needs.index', ['need_group_id' => $group->id, 'search' => 'Komputer']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 1)
            ->where('needs.data.0.title', 'Pengadaan Komputer')
        );
});

test('index can filter needs by year', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    Need::factory()->create(['need_group_id' => $group->id, 'year' => 2024, 'organizational_unit_id' => $unit->id, 'need_type_id' => $needType->id]);
    Need::factory()->create(['need_group_id' => $group->id, 'year' => 2025, 'organizational_unit_id' => $unit->id, 'need_type_id' => $needType->id]);
    Need::factory()->create(['need_group_id' => $group->id, 'year' => 2026, 'organizational_unit_id' => $unit->id, 'need_type_id' => $needType->id]);

    $this->actingAs($user)
        ->get(route('needs.index', ['need_group_id' => $group->id, 'year' => [2024]]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 1)
            ->where('needs.data.0.year', 2024)
        );

    $this->actingAs($user)
        ->get(route('needs.index', ['need_group_id' => $group->id, 'year' => [2025, 2026]]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 2)
        );
});

test('index can filter needs by status', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    Need::factory()->create(['need_group_id' => $group->id, 'status' => 'draft', 'organizational_unit_id' => $unit->id, 'need_type_id' => $needType->id]);
    Need::factory()->create(['need_group_id' => $group->id, 'status' => 'submitted', 'organizational_unit_id' => $unit->id, 'need_type_id' => $needType->id]);

    $this->actingAs($user)
        ->get(route('needs.index', ['need_group_id' => $group->id, 'status' => ['draft']]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 1)
            ->where('needs.data.0.status', 'draft')
        );
});

test('index can filter needs by need_type_id and organizational_unit_id', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit1 = OrganizationalUnit::factory()->create();
    $unit2 = OrganizationalUnit::factory()->create();
    $type1 = NeedType::factory()->create();
    $type2 = NeedType::factory()->create();

    Need::factory()->create(['need_group_id' => $group->id, 'organizational_unit_id' => $unit1->id, 'need_type_id' => $type1->id]);
    Need::factory()->create(['need_group_id' => $group->id, 'organizational_unit_id' => $unit2->id, 'need_type_id' => $type2->id]);

    $this->actingAs($user)
        ->get(route('needs.index', ['need_group_id' => $group->id, 'need_type_id' => [$type1->id]]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('needs.data', 1)->where('needs.data.0.need_type_id', $type1->id));

    $this->actingAs($user)
        ->get(route('needs.index', ['need_group_id' => $group->id, 'organizational_unit_id' => [$unit2->id]]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('needs.data', 1)->where('needs.data.0.organizational_unit_id', $unit2->id));
});

test('index props only include active need types', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);

    $activeType = NeedType::factory()->create(['name' => 'Active Type', 'is_active' => true]);
    NeedType::factory()->create(['name' => 'Inactive Type', 'is_active' => false]);

    $this->actingAs($user)
        ->get(route('needs.index', ['need_group_id' => $group->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needTypes', 1)
            ->where('needTypes.0.name', 'Active Type')
        );
});

test('index loads relationships for needs', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    Need::factory()->create([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
    ]);

    $this->actingAs($user)
        ->get(route('needs.index', ['need_group_id' => $group->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data.0.organizational_unit')
            ->has('needs.data.0.need_type')
        );
});

test('index does not show soft-deleted needs', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    $need = Need::factory()->create(['need_group_id' => $group->id, 'organizational_unit_id' => $unit->id, 'need_type_id' => $needType->id]);
    $need->delete();

    $this->actingAs($user)
        ->get(route('needs.index', ['need_group_id' => $group->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 0)
        );
});

// ─── Store ────────────────────────────────────────────────────────────────────

test('store creates a new need', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    $this->actingAs($user)
        ->post(route('needs.store'), validNeedPayload($group, $unit, $needType))
        ->assertRedirect(route('needs.index', ['need_group_id' => $group->id]))
        ->assertSessionHas('success', 'Usulan kebutuhan berhasil dibuat.');

    $this->assertDatabaseHas('needs', [
        'need_group_id' => $group->id,
        'title' => 'Pengadaan Komputer',
        'unit' => 'unit',
        'status' => 'draft',
    ]);
});

test('store validates required fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('needs.store'), [])
        ->assertSessionHasErrors([
            'organizational_unit_id',
            'need_type_id',
            'year',
            'title',
            'volume',
            'unit',
            'unit_price',
            'total_price',
            'urgency',
            'impact',
        ]);
});

test('store validates unit must be a valid enum value', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    $this->actingAs($user)
        ->post(route('needs.store'), validNeedPayload($group, $unit, $needType, ['unit' => 'invalid-unit']))
        ->assertSessionHasErrors(['unit']);
});

test('store validates status must be a valid value', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    $this->actingAs($user)
        ->post(route('needs.store'), validNeedPayload($group, $unit, $needType, ['status' => 'pending']))
        ->assertSessionHasErrors(['status']);
});

test('store validations on numeric fields ensuring values cannot be negative', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    $payload = validNeedPayload($group, $unit, $needType, [
        'volume' => -5,
        'unit_price' => -100,
        'total_price' => -500,
    ]);

    $this->actingAs($user)
        ->post(route('needs.store'), $payload)
        ->assertSessionHasErrors(['volume', 'unit_price', 'total_price']);
});

// ─── Update ───────────────────────────────────────────────────────────────────

test('update modifies an existing need', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();
    $need = Need::factory()->create([
        'need_group_id' => $group->id,
        'title' => 'Judul Lama',
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
    ]);

    $this->actingAs($user)
        ->put(route('needs.update', $need), validNeedPayload($group, $unit, $needType, ['title' => 'Judul Baru']))
        ->assertRedirect(route('needs.index', ['need_group_id' => $group->id]))
        ->assertSessionHas('success', 'Usulan kebutuhan berhasil diperbarui.');

    expect($need->fresh()->title)->toBe('Judul Baru');
});

test('update validates required fields', function () {
    $user = User::factory()->create();
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();
    $need = Need::factory()->create([
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
    ]);

    $this->actingAs($user)
        ->put(route('needs.update', $need), [])
        ->assertSessionHasErrors([
            'organizational_unit_id',
            'need_type_id',
            'year',
            'title',
            'volume',
            'unit',
            'unit_price',
            'total_price',
            'urgency',
            'impact',
        ]);
});

test('update numerical fields cannot be negative', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();
    $need = Need::factory()->create([
        'need_group_id' => $group->id,
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
    ]);

    $payload = validNeedPayload($group, $unit, $needType, [
        'volume' => -5,
        'unit_price' => -100,
        'total_price' => -500,
    ]);

    $this->actingAs($user)
        ->put(route('needs.update', $need), $payload)
        ->assertSessionHasErrors(['volume', 'unit_price', 'total_price']);
});

// ─── Destroy ─────────────────────────────────────────────────────────────────

test('destroy soft-deletes a need', function () {
    $user = User::factory()->create();
    $group = NeedGroup::factory()->create(['is_active' => true]);
    $need = Need::factory()->create(['need_group_id' => $group->id]);

    $this->actingAs($user)
        ->delete(route('needs.destroy', $need))
        ->assertRedirect(route('needs.index', ['need_group_id' => $group->id]))
        ->assertSessionHas('success', 'Usulan kebutuhan berhasil dihapus.');

    $this->assertSoftDeleted($need);
});
