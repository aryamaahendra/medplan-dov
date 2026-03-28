<?php

use App\Models\Need;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validNeedPayload(OrganizationalUnit $unit, NeedType $needType, array $overrides = []): array
{
    return array_merge([
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
        'status' => 'draft',
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
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();
    Need::factory()->count(3)->create([
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
    ]);

    $this->actingAs($user)
        ->get(route('needs.index'))
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
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    Need::factory()->create(['title' => 'Pengadaan Komputer', 'organizational_unit_id' => $unit->id, 'need_type_id' => $needType->id]);
    Need::factory()->create(['title' => 'Renovasi Gedung', 'organizational_unit_id' => $unit->id, 'need_type_id' => $needType->id]);

    $this->actingAs($user)
        ->get(route('needs.index', ['search' => 'Komputer']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needs.data', 1)
            ->where('needs.data.0.title', 'Pengadaan Komputer')
        );
});

// ─── Store ────────────────────────────────────────────────────────────────────

test('store creates a new need', function () {
    $user = User::factory()->create();
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    $this->actingAs($user)
        ->post(route('needs.store'), validNeedPayload($unit, $needType))
        ->assertRedirect(route('needs.index'))
        ->assertSessionHas('success', 'Usulan kebutuhan berhasil dibuat.');

    $this->assertDatabaseHas('needs', [
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
        ]);
});

test('store validates unit must be a valid enum value', function () {
    $user = User::factory()->create();
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    $this->actingAs($user)
        ->post(route('needs.store'), validNeedPayload($unit, $needType, ['unit' => 'invalid-unit']))
        ->assertSessionHasErrors(['unit']);
});

test('store validates status must be a valid value', function () {
    $user = User::factory()->create();
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();

    $this->actingAs($user)
        ->post(route('needs.store'), validNeedPayload($unit, $needType, ['status' => 'pending']))
        ->assertSessionHasErrors(['status']);
});

// ─── Update ───────────────────────────────────────────────────────────────────

test('update modifies an existing need', function () {
    $user = User::factory()->create();
    $unit = OrganizationalUnit::factory()->create();
    $needType = NeedType::factory()->create();
    $need = Need::factory()->create([
        'title' => 'Judul Lama',
        'organizational_unit_id' => $unit->id,
        'need_type_id' => $needType->id,
    ]);

    $this->actingAs($user)
        ->put(route('needs.update', $need), validNeedPayload($unit, $needType, ['title' => 'Judul Baru']))
        ->assertRedirect(route('needs.index'))
        ->assertSessionHas('success', 'Usulan kebutuhan berhasil diperbarui.');

    expect($need->fresh()->title)->toBe('Judul Baru');
});

// ─── Destroy ─────────────────────────────────────────────────────────────────

test('destroy soft-deletes a need', function () {
    $user = User::factory()->create();
    $need = Need::factory()->create();

    $this->actingAs($user)
        ->delete(route('needs.destroy', $need))
        ->assertRedirect(route('needs.index'))
        ->assertSessionHas('success', 'Usulan kebutuhan berhasil dihapus.');

    $this->assertSoftDeleted($need);
});
