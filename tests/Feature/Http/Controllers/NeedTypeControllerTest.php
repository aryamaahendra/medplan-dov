<?php

use App\Models\NeedType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guest cannot access need types index', function () {
    $this->get(route('need-types.index'))
        ->assertRedirect(route('login'));
});

test('index renders the correct component and props', function () {
    $user = User::factory()->create();
    NeedType::factory()->count(3)->create();

    $this->actingAs($user)
        ->get(route('need-types.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('need/types/index')
            ->has('needTypes.data', 3)
            ->has('filters')
        );
});

test('index can filter need types by search', function () {
    $user = User::factory()->create();
    NeedType::factory()->create(['name' => 'Regular Need', 'code' => 'REG']);
    NeedType::factory()->create(['name' => 'Urgent Need', 'code' => 'URG']);

    $this->actingAs($user)
        ->get(route('need-types.index', ['search' => 'Urgent']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('needTypes.data', 1)
            ->where('needTypes.data.0.name', 'Urgent Need')
        );
});

test('store creates a new need type', function () {
    $user = User::factory()->create();
    $data = [
        'name' => 'New Need Type',
        'code' => 'NEW-01',
        'description' => 'A new kind of need',
        'is_active' => true,
        'order_column' => 10,
    ];

    $this->actingAs($user)
        ->post(route('need-types.store'), $data)
        ->assertRedirect(route('need-types.index'))
        ->assertSessionHas('success', 'Jenis kebutuhan berhasil dibuat.');

    $this->assertDatabaseHas('need_types', [
        'name' => 'New Need Type',
        'code' => 'NEW-01',
        'order_column' => 10,
    ]);
});

test('store validates required fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('need-types.store'), [])
        ->assertSessionHasErrors(['name', 'code']);
});

test('store validates unique code', function () {
    $user = User::factory()->create();
    NeedType::factory()->create(['code' => 'EXISTING']);

    $this->actingAs($user)
        ->post(route('need-types.store'), [
            'name' => 'New',
            'code' => 'EXISTING',
            'order_column' => 0,
        ])
        ->assertSessionHasErrors(['code']);
});

test('update modifies an existing need type', function () {
    $user = User::factory()->create();
    $needType = NeedType::factory()->create(['name' => 'Old Name']);

    $this->actingAs($user)
        ->patch(route('need-types.update', $needType), [
            'name' => 'Updated Name',
            'code' => $needType->code,
            'order_column' => 5,
        ])
        ->assertRedirect(route('need-types.index'))
        ->assertSessionHas('success', 'Jenis kebutuhan berhasil diperbarui.');

    expect($needType->fresh()->name)->toBe('Updated Name');
    expect($needType->fresh()->order_column)->toBe(5);
});

test('update validates unique code ignoring current model', function () {
    $user = User::factory()->create();
    $needType = NeedType::factory()->create(['code' => 'UNIQUE-CODE']);

    $this->actingAs($user)
        ->patch(route('need-types.update', $needType), [
            'name' => 'Updated Name',
            'code' => 'UNIQUE-CODE',
            'order_column' => 1,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('need-types.index'));
});

test('destroy deletes a need type', function () {
    $user = User::factory()->create();
    $needType = NeedType::factory()->create();

    $this->actingAs($user)
        ->delete(route('need-types.destroy', $needType))
        ->assertRedirect(route('need-types.index'))
        ->assertSessionHas('success', 'Jenis kebutuhan berhasil dihapus.');

    $this->assertSoftDeleted($needType);
});
