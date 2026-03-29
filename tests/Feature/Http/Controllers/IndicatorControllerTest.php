<?php

use App\Models\Indicator;
use App\Models\IndicatorTarget;
use App\Models\Renstra;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validIndicatorPayload(Renstra $renstra, array $overrides = []): array
{
    return array_merge([
        'renstra_id' => $renstra->id,
        'name' => 'Persentase Layanan Digital',
        'baseline' => '10%',
        'description' => 'Meningkatkan layanan berbasis digital.',
        'targets' => [
            ['year' => $renstra->year_start, 'target' => '20%'],
            ['year' => $renstra->year_start + 1, 'target' => '50%'],
        ],
    ], $overrides);
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────

test('guest cannot create, update, or delete indicators', function () {
    $indicator = Indicator::factory()->create();

    $this->post(route('indicators.store'), ['name' => 'Test Indicator'])
        ->assertRedirect(route('login'));

    $this->put(route('indicators.update', $indicator), ['name' => 'Test Update'])
        ->assertRedirect(route('login'));

    $this->delete(route('indicators.destroy', $indicator))
        ->assertRedirect(route('login'));
});

// ─── Store ────────────────────────────────────────────────────────────────────

test('store creates a new indicator and its targets', function () {
    $user = User::factory()->create();
    $renstra = Renstra::factory()->create(['year_start' => 2025, 'year_end' => 2029]);

    $payload = validIndicatorPayload($renstra);

    $this->actingAs($user)
        ->from(route('renstras.show', $renstra))
        ->post(route('indicators.store'), $payload)
        ->assertRedirect(route('renstras.show', $renstra))
        ->assertSessionHas('success', 'Indikator berhasil dibuat.');

    $this->assertDatabaseHas('indicators', [
        'renstra_id' => $renstra->id,
        'name' => 'Persentase Layanan Digital',
        'baseline' => '10%',
        'description' => 'Meningkatkan layanan berbasis digital.',
    ]);

    $indicator = Indicator::where('name', 'Persentase Layanan Digital')->first();

    $this->assertDatabaseHas('indicator_targets', [
        'indicator_id' => $indicator->id,
        'year' => 2025,
        'target' => '20%',
    ]);

    $this->assertDatabaseHas('indicator_targets', [
        'indicator_id' => $indicator->id,
        'year' => 2026,
        'target' => '50%',
    ]);
});

test('store validates required fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('indicators.store'), [])
        ->assertSessionHasErrors([
            'renstra_id',
            'name',
            'targets',
        ]);
});

test('store validates target nested fields', function () {
    $user = User::factory()->create();
    $renstra = Renstra::factory()->create();

    $payload = validIndicatorPayload($renstra, [
        'targets' => [
            ['year' => null, 'target' => ''],
        ],
    ]);

    $this->actingAs($user)
        ->post(route('indicators.store'), $payload)
        ->assertSessionHasErrors([
            'targets.0.year',
            'targets.0.target',
        ]);
});

// ─── Update ───────────────────────────────────────────────────────────────────

test('update modifies an existing indicator and its targets', function () {
    $user = User::factory()->create();
    $renstra = Renstra::factory()->create(['year_start' => 2025, 'year_end' => 2029]);

    // Create baseline indicator
    $indicator = Indicator::factory()->create([
        'renstra_id' => $renstra->id,
        'name' => 'Indikator Lama',
    ]);

    // Create old targets
    IndicatorTarget::create([
        'indicator_id' => $indicator->id,
        'year' => 2025,
        'target' => '10%',
    ]);

    $payload = validIndicatorPayload($renstra, [
        'name' => 'Indikator Baru',
        'targets' => [
            ['year' => 2025, 'target' => '15%'],
            ['year' => 2026, 'target' => '30%'],
        ],
    ]);

    $this->actingAs($user)
        ->from(route('renstras.show', $renstra))
        ->put(route('indicators.update', $indicator), $payload)
        ->assertRedirect(route('renstras.show', $renstra))
        ->assertSessionHas('success', 'Indikator berhasil diperbarui.');

    // Assert main record is updated
    expect($indicator->fresh()->name)->toBe('Indikator Baru');

    // Assert old target is replaced/updated correctly
    $this->assertDatabaseCount('indicator_targets', 2);
    $this->assertDatabaseHas('indicator_targets', [
        'indicator_id' => $indicator->id,
        'year' => 2025,
        'target' => '15%',
    ]);
    $this->assertDatabaseHas('indicator_targets', [
        'indicator_id' => $indicator->id,
        'year' => 2026,
        'target' => '30%',
    ]);
});

test('update validates required fields', function () {
    $user = User::factory()->create();
    $indicator = Indicator::factory()->create();

    $this->actingAs($user)
        ->put(route('indicators.update', $indicator), [])
        ->assertSessionHasErrors([
            'renstra_id',
            'name',
            'targets',
        ]);
});

// ─── Destroy ─────────────────────────────────────────────────────────────────

test('destroy deletes an indicator and cascades its targets', function () {
    $user = User::factory()->create();

    $indicator = Indicator::factory()->create();
    IndicatorTarget::create([
        'indicator_id' => $indicator->id,
        'year' => 2025,
        'target' => 'Some Target',
    ]);

    // Ensure they exist initially
    $this->assertDatabaseHas('indicators', ['id' => $indicator->id]);
    $this->assertDatabaseHas('indicator_targets', ['indicator_id' => $indicator->id]);

    $this->actingAs($user)
        ->from(route('renstras.show', $indicator->renstra))
        ->delete(route('indicators.destroy', $indicator))
        ->assertRedirect(route('renstras.show', $indicator->renstra))
        ->assertSessionHas('success', 'Indikator berhasil dihapus.');

    // Assert indicator is missing
    $this->assertDatabaseMissing('indicators', ['id' => $indicator->id]);

    // Assert targets are missing (cascade on delete)
    $this->assertDatabaseMissing('indicator_targets', ['indicator_id' => $indicator->id]);
});
