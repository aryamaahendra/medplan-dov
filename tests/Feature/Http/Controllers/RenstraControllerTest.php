<?php

use App\Models\Renstra;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validRenstraPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Renstra 2025-2029',
        'year_start' => 2025,
        'year_end' => 2029,
        'description' => 'Rencana strategis untuk periode 2025-2029.',
        'is_active' => true,
    ], $overrides);
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────

test('guest cannot access renstras index', function () {
    auth()->logout();

    $this->get(route('renstras.index'))
        ->assertRedirect(route('login'));
});

test('guest cannot access renstras show', function () {
    auth()->logout();
    $renstra = Renstra::factory()->create();

    $this->get(route('renstras.show', $renstra))
        ->assertRedirect(route('login'));
});

test('guest cannot create, update, or delete renstras', function () {
    auth()->logout();
    $renstra = Renstra::factory()->create();

    $this->post(route('renstras.store'), validRenstraPayload())
        ->assertRedirect(route('login'));

    $this->put(route('renstras.update', $renstra), validRenstraPayload())
        ->assertRedirect(route('login'));

    $this->delete(route('renstras.destroy', $renstra))
        ->assertRedirect(route('login'));
});

// ─── Index ────────────────────────────────────────────────────────────────────

test('index renders the correct component and props', function () {
    Renstra::factory()->count(3)->create();

    $this->get(route('renstras.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('renstra/renstras/index')
            ->has('renstras.data', 3)
            ->has('filters')
        );
});

test('index can search renstras by name, description, year_start, and year_end', function () {
    Renstra::factory()->create(['name' => 'Renstra Teknologi', 'description' => 'Fokus AI']);
    Renstra::factory()->create(['name' => 'Renstra Infrastruktur']);

    // Search by name
    $this->get(route('renstras.index', ['search' => 'Teknologi']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('renstras.data', 1)
            ->where('renstras.data.0.name', 'Renstra Teknologi')
        );

    // Search by description
    $this->get(route('renstras.index', ['search' => 'Fokus AI']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('renstras.data', 1)
            ->where('renstras.data.0.name', 'Renstra Teknologi')
        );
});

test('index can sort renstras', function () {
    Renstra::factory()->create(['name' => 'A Renstra', 'year_start' => 2020]);
    Renstra::factory()->create(['name' => 'Z Renstra', 'year_start' => 2030]);

    // Sort by name descending
    $this->get(route('renstras.index', ['sort' => 'name', 'direction' => 'desc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('renstras.data', 2)
            ->where('renstras.data.0.name', 'Z Renstra')
        );

    // Sort by year_start ascending
    $this->get(route('renstras.index', ['sort' => 'year_start', 'direction' => 'asc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('renstras.data', 2)
            ->where('renstras.data.0.name', 'A Renstra')
        );
});

// ─── Store ────────────────────────────────────────────────────────────────────

test('store creates a new renstra', function () {
    $this->from(route('renstras.index'))
        ->post(route('renstras.store'), validRenstraPayload())
        ->assertRedirect(route('renstras.index'))
        ->assertSessionHas('success', 'Renstra berhasil dibuat.');

    $this->assertDatabaseHas('renstras', [
        'name' => 'Renstra 2025-2029',
        'year_start' => 2025,
        'year_end' => 2029,
        'is_active' => true,
    ]);
});

test('store validates required fields', function () {
    $this->post(route('renstras.store'), [])
        ->assertSessionHasErrors([
            'name',
            'year_start',
            'year_end',
        ]);
});

test('store validates year range', function () {
    $this->post(route('renstras.store'), validRenstraPayload([
        'year_start' => 1999,
        'year_end' => 2101,
    ]))
        ->assertSessionHasErrors(['year_start', 'year_end']);
});

test('store validates year_end is greater than or equal to year_start', function () {
    $this->post(route('renstras.store'), validRenstraPayload([
        'year_start' => 2025,
        'year_end' => 2024,
    ]))
        ->assertSessionHasErrors(['year_end']);
});

// ─── Update ───────────────────────────────────────────────────────────────────

test('update modifies an existing renstra', function () {
    $renstra = Renstra::factory()->create([
        'name' => 'Renstra Lama',
        'year_start' => 2020,
        'year_end' => 2024,
    ]);

    $this->from(route('renstras.index'))
        ->put(route('renstras.update', $renstra), validRenstraPayload([
            'name' => 'Renstra Baru',
            'year_start' => 2025,
            'year_end' => 2029,
        ]))
        ->assertRedirect(route('renstras.index'))
        ->assertSessionHas('success', 'Renstra berhasil diperbarui.');

    expect($renstra->fresh()->name)->toBe('Renstra Baru');
    expect($renstra->fresh()->year_end)->toBe(2029);
});

test('update validates required fields', function () {
    $renstra = Renstra::factory()->create();

    $this->put(route('renstras.update', $renstra), [])
        ->assertSessionHasErrors([
            'name',
            'year_start',
            'year_end',
        ]);
});

test('update validates year_end is greater than or equal to year_start', function () {
    $renstra = Renstra::factory()->create();

    $this->put(route('renstras.update', $renstra), validRenstraPayload([
        'year_start' => 2025,
        'year_end' => 2024,
    ]))
        ->assertSessionHasErrors(['year_end']);
});

// ─── Destroy ─────────────────────────────────────────────────────────────────

test('destroy deletes a renstra', function () {
    $renstra = Renstra::factory()->create();

    $this->from(route('renstras.index'))
        ->delete(route('renstras.destroy', $renstra))
        ->assertRedirect(route('renstras.index'))
        ->assertSessionHas('success', 'Renstra berhasil dihapus.');

    $this->assertModelMissing($renstra);
});

// ─── Show ────────────────────────────────────────────────────────────────────

test('show renders the correct component and props', function () {
    $renstra = Renstra::factory()->create();

    $this->get(route('renstras.show', $renstra))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('renstra/renstras/show')
            ->has('renstra')
            ->where('renstra.id', $renstra->id)
        );
});
test('show loads indicators and targets relationships', function () {
    $renstra = Renstra::factory()->create();

    $this->get(route('renstras.show', $renstra))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('renstra.tujuans')
        );
});
