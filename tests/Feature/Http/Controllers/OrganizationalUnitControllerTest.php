<?php

use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guest cannot access organizational units index', function () {
    $this->get(route('organizational-units.index'))
        ->assertRedirect(route('login'));
});

test('index renders the correct component and props', function () {
    $user = User::factory()->create();
    $units = OrganizationalUnit::factory()->count(3)->create();

    $this->actingAs($user)
        ->get(route('organizational-units.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('organizational-units/index')
            ->has('units.data', 3)
            ->has('allUnits', 3)
            ->has('filters')
        );
});

test('index can filter units by name', function () {
    $user = User::factory()->create();
    OrganizationalUnit::factory()->create(['name' => 'Finance Department']);
    OrganizationalUnit::factory()->create(['name' => 'IT Department']);

    $this->actingAs($user)
        ->get(route('organizational-units.index', ['search' => 'Finance']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('units.data', 1)
            ->where('units.data.0.name', 'Finance Department')
        );
});

test('store creates a new organizational unit', function () {
    $user = User::factory()->create();
    $data = [
        'name' => 'New Unit',
        'code' => 'UNIT-001',
        'parent_id' => null,
    ];

    $this->actingAs($user)
        ->post(route('organizational-units.store'), $data)
        ->assertRedirect(route('organizational-units.index'))
        ->assertSessionHas('success', 'Unit organisasi berhasil dibuat.');

    $this->assertDatabaseHas('organizational_units', [
        'name' => 'New Unit',
        'code' => 'UNIT-001',
    ]);
});

test('store validates required fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('organizational-units.store'), [])
        ->assertSessionHasErrors(['name', 'code']);
});

test('store validates unique code', function () {
    $user = User::factory()->create();
    OrganizationalUnit::factory()->create(['code' => 'EXISTING-CODE']);

    $this->actingAs($user)
        ->post(route('organizational-units.store'), [
            'name' => 'New Unit',
            'code' => 'EXISTING-CODE',
        ])
        ->assertSessionHasErrors(['code']);
});

test('update modifies an existing organizational unit', function () {
    $user = User::factory()->create();
    $unit = OrganizationalUnit::factory()->create(['name' => 'Old Name']);

    $this->actingAs($user)
        ->put(route('organizational-units.update', $unit), [
            'name' => 'Updated Name',
            'code' => $unit->code,
        ])
        ->assertRedirect(route('organizational-units.index'))
        ->assertSessionHas('success', 'Unit organisasi berhasil diperbarui.');

    expect($unit->fresh()->name)->toBe('Updated Name');
});

test('update validates unique code ignoring current model', function () {
    $user = User::factory()->create();
    $unit = OrganizationalUnit::factory()->create(['code' => 'MY-CODE']);

    $this->actingAs($user)
        ->put(route('organizational-units.update', $unit), [
            'name' => 'Updated Name',
            'code' => 'MY-CODE',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('organizational-units.index'));
});

test('destroy deletes an organizational unit', function () {
    $user = User::factory()->create();
    $unit = OrganizationalUnit::factory()->create();

    $this->actingAs($user)
        ->delete(route('organizational-units.destroy', $unit))
        ->assertRedirect(route('organizational-units.index'))
        ->assertSessionHas('success', 'Unit organisasi berhasil dihapus.');

    $this->assertSoftDeleted($unit);
});
