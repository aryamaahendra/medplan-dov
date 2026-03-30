<?php

use App\Models\Renstra;
use App\Models\Tujuan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validTujuanPayload(Renstra $renstra, array $overrides = []): array
{
    return array_merge([
        'renstra_id' => $renstra->id,
        'name' => 'Meningkatkan Kualitas SDM',
        'description' => 'Tujuan untuk meningkatkan kualitas sumber daya manusia di lingkungan instansi.',
    ], $overrides);
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────

test('guest cannot create, update, or delete tujuans', function () {
    $tujuan = Tujuan::factory()->create();

    $this->post(route('tujuans.store'), ['name' => 'Test Tujuan'])
        ->assertRedirect(route('login'));

    $this->put(route('tujuans.update', $tujuan), ['name' => 'Test Update'])
        ->assertRedirect(route('login'));

    $this->delete(route('tujuans.destroy', $tujuan))
        ->assertRedirect(route('login'));
});

// ─── Store ────────────────────────────────────────────────────────────────────

test('store creates a new tujuan', function () {
    $user = User::factory()->create();
    $renstra = Renstra::factory()->create();

    $payload = validTujuanPayload($renstra);

    $this->actingAs($user)
        ->from(route('renstras.show', $renstra))
        ->post(route('tujuans.store'), $payload)
        ->assertRedirect(route('renstras.show', $renstra))
        ->assertSessionHas('success', 'Tujuan berhasil dibuat.');

    $this->assertDatabaseHas('tujuans', [
        'renstra_id' => $renstra->id,
        'name' => 'Meningkatkan Kualitas SDM',
        'description' => 'Tujuan untuk meningkatkan kualitas sumber daya manusia di lingkungan instansi.',
    ]);
});

test('store validates required fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('tujuans.store'), [])
        ->assertSessionHasErrors([
            'renstra_id',
            'name',
        ]);
});

// ─── Update ───────────────────────────────────────────────────────────────────

test('update modifies an existing tujuan', function () {
    $user = User::factory()->create();
    $renstra = Renstra::factory()->create();

    $tujuan = Tujuan::factory()->create([
        'renstra_id' => $renstra->id,
        'name' => 'Tujuan Lama',
    ]);

    $payload = validTujuanPayload($renstra, [
        'name' => 'Tujuan Baru',
    ]);

    $this->actingAs($user)
        ->from(route('renstras.show', $renstra))
        ->put(route('tujuans.update', $tujuan), $payload)
        ->assertRedirect(route('renstras.show', $renstra))
        ->assertSessionHas('success', 'Tujuan berhasil diperbarui.');

    expect($tujuan->fresh()->name)->toBe('Tujuan Baru');
});

test('update validates required fields', function () {
    $user = User::factory()->create();
    $tujuan = Tujuan::factory()->create();

    $this->actingAs($user)
        ->put(route('tujuans.update', $tujuan), [])
        ->assertSessionHasErrors([
            'renstra_id',
            'name',
        ]);
});

// ─── Destroy ─────────────────────────────────────────────────────────────────

test('destroy deletes a tujuan', function () {
    $user = User::factory()->create();
    $tujuan = Tujuan::factory()->create();

    $this->assertDatabaseHas('tujuans', ['id' => $tujuan->id]);

    $this->actingAs($user)
        ->from(route('renstras.show', $tujuan->renstra))
        ->delete(route('tujuans.destroy', $tujuan))
        ->assertRedirect(route('renstras.show', $tujuan->renstra))
        ->assertSessionHas('success', 'Tujuan berhasil dihapus.');

    $this->assertDatabaseMissing('tujuans', ['id' => $tujuan->id]);
});
