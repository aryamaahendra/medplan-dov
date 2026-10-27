<?php

use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
});

test('guest cannot access organizational units index', function () {
    auth()->logout();

    $this->get(route('organizational-units.index'))
        ->assertRedirect(route('login'));
});

test('index renders the correct component and props', function () {
    $units = OrganizationalUnit::factory()->count(3)->create();

    $this->get(route('organizational-units.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('management/organizational-units/index')
            ->has('units.data', 3)
            ->has('allUnits', 3)
            ->has('filters')
        );
});

test('index can filter units by name', function () {
    OrganizationalUnit::factory()->create(['name' => 'Finance Department']);
    OrganizationalUnit::factory()->create(['name' => 'IT Department']);

    $this->get(route('organizational-units.index', ['search' => 'Finance']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('units.data', 1)
            ->where('units.data.0.name', 'Finance Department')
        );
});

test('store creates a new organizational unit', function () {
    $data = [
        'name' => 'New Unit',
        'code' => 'UNIT-001',
        'parent_id' => null,
    ];

    $this->post(route('organizational-units.store'), $data)
        ->assertRedirect(route('organizational-units.index'))
        ->assertSessionHas('success', 'Unit organisasi berhasil dibuat.');

    $this->assertDatabaseHas('organizational_units', [
        'name' => 'New Unit',
        'code' => 'UNIT-001',
    ]);
});

test('store validates required fields', function () {
    $this->post(route('organizational-units.store'), [])
        ->assertSessionHasErrors(['name', 'code']);
});

test('store validates unique code', function () {
    OrganizationalUnit::factory()->create(['code' => 'EXISTING-CODE']);

    $this->post(route('organizational-units.store'), [
        'name' => 'New Unit',
        'code' => 'EXISTING-CODE',
    ])
        ->assertSessionHasErrors(['code']);
});

test('update modifies an existing organizational unit', function () {
    $unit = OrganizationalUnit::factory()->create(['name' => 'Old Name']);

    $this->put(route('organizational-units.update', $unit), [
        'name' => 'Updated Name',
        'code' => $unit->code,
    ])
        ->assertRedirect(route('organizational-units.index'))
        ->assertSessionHas('success', 'Unit organisasi berhasil diperbarui.');

    expect($unit->fresh()->name)->toBe('Updated Name');
});

test('update validates unique code ignoring current model', function () {
    $unit = OrganizationalUnit::factory()->create(['code' => 'MY-CODE']);

    $this->put(route('organizational-units.update', $unit), [
        'name' => 'Updated Name',
        'code' => 'MY-CODE',
    ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('organizational-units.index'));
});

test('destroy deletes an organizational unit', function () {
    $unit = OrganizationalUnit::factory()->create();

    $this->delete(route('organizational-units.destroy', $unit))
        ->assertRedirect(route('organizational-units.index'))
        ->assertSessionHas('success', 'Unit organisasi berhasil dihapus.');

    $this->assertSoftDeleted($unit);
});

test('destroy fails with error when organizational unit has child units', function () {
    $parent = OrganizationalUnit::factory()->create();
    OrganizationalUnit::factory()->create(['parent_id' => $parent->id]);

    $this->from(route('organizational-units.index'))
        ->delete(route('organizational-units.destroy', $parent))
        ->assertRedirect(route('organizational-units.index'))
        ->assertSessionHasErrors(['error']);

    $this->assertNotSoftDeleted($parent);
});

test('destroy fails with error when organizational unit has users', function () {
    $unit = OrganizationalUnit::factory()->create();
    User::factory()->create(['organizational_unit_id' => $unit->id]);

    $this->from(route('organizational-units.index'))
        ->delete(route('organizational-units.destroy', $unit))
        ->assertRedirect(route('organizational-units.index'))
        ->assertSessionHasErrors(['error']);

    $this->assertNotSoftDeleted($unit);
});
