<?php

use App\Models\Indicator;
use App\Models\IndicatorTarget;
use App\Models\Renstra;
use App\Models\Sasaran;
use App\Models\Tujuan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function validIndicatorPayload(Tujuan $tujuan, array $overrides = []): array
{
    return array_merge([
        'tujuan_id' => $tujuan->id,
        'name' => 'Persentase Layanan Digital',
        'baseline' => '10%',
        'description' => 'Meningkatkan layanan berbasis digital.',
        'targets' => [
            ['year' => $tujuan->renstra->year_start, 'target' => '20%'],
            ['year' => $tujuan->renstra->year_start + 1, 'target' => '50%'],
        ],
    ], $overrides);
}

function validSasaranIndicatorPayload(Sasaran $sasaran, array $overrides = []): array
{
    $renstra = $sasaran->tujuan->renstra;

    return array_merge([
        'sasaran_id' => $sasaran->id,
        'name' => 'Persentase Layanan Digital Sasaran',
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
    $tujuan = Tujuan::factory()->create(['renstra_id' => $renstra->id]);

    $payload = validIndicatorPayload($tujuan);

    $this->actingAs($user)
        ->from(route('renstras.show', $renstra))
        ->post(route('indicators.store'), $payload)
        ->assertRedirect(route('renstras.show', $renstra))
        ->assertSessionHas('success', 'Indikator berhasil dibuat.');

    $this->assertDatabaseHas('indicators', [
        'tujuan_id' => $tujuan->id,
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
            'tujuan_id',
            'sasaran_id',
            'name',
            'targets',
        ]);
});

test('store creates a new indicator for sasaran', function () {
    $user = User::factory()->create();
    $renstra = Renstra::factory()->create(['year_start' => 2025, 'year_end' => 2029]);
    $tujuan = Tujuan::factory()->create(['renstra_id' => $renstra->id]);
    $sasaran = Sasaran::factory()->create(['tujuan_id' => $tujuan->id]);

    $payload = validSasaranIndicatorPayload($sasaran);

    $this->actingAs($user)
        ->from(route('renstras.show', $renstra))
        ->post(route('indicators.store'), $payload)
        ->assertRedirect(route('renstras.show', $renstra))
        ->assertSessionHas('success', 'Indikator berhasil dibuat.');

    $this->assertDatabaseHas('indicators', [
        'sasaran_id' => $sasaran->id,
        'name' => 'Persentase Layanan Digital Sasaran',
        'baseline' => '10%',
        'description' => 'Meningkatkan layanan berbasis digital.',
    ]);
});

test('store validates target nested fields', function () {
    $user = User::factory()->create();
    $tujuan = Tujuan::factory()->create();

    $payload = validIndicatorPayload($tujuan, [
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
    $tujuan = Tujuan::factory()->create(['renstra_id' => $renstra->id]);

    // Create baseline indicator
    $indicator = Indicator::factory()->create([
        'tujuan_id' => $tujuan->id,
        'name' => 'Indikator Lama',
    ]);

    // Create old targets
    IndicatorTarget::create([
        'indicator_id' => $indicator->id,
        'year' => 2025,
        'target' => '10%',
    ]);

    $payload = validIndicatorPayload($tujuan, [
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
            'tujuan_id',
            'sasaran_id',
            'name',
            'targets',
        ]);
});

test('update modifies a sasaran indicator', function () {
    $user = User::factory()->create();
    $renstra = Renstra::factory()->create(['year_start' => 2025, 'year_end' => 2029]);
    $tujuan = Tujuan::factory()->create(['renstra_id' => $renstra->id]);
    $sasaran = Sasaran::factory()->create(['tujuan_id' => $tujuan->id]);

    $indicator = Indicator::factory()->create([
        'sasaran_id' => $sasaran->id,
        'tujuan_id' => null,
        'name' => 'Indikator Sasaran Lama',
    ]);

    $payload = validSasaranIndicatorPayload($sasaran, [
        'name' => 'Indikator Sasaran Baru',
    ]);

    $this->actingAs($user)
        ->from(route('renstras.show', $renstra))
        ->put(route('indicators.update', $indicator), $payload)
        ->assertRedirect(route('renstras.show', $renstra))
        ->assertSessionHas('success', 'Indikator berhasil diperbarui.');

    expect($indicator->fresh()->name)->toBe('Indikator Sasaran Baru');
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
        ->from(route('renstras.show', $indicator->tujuan_id ? $indicator->tujuan->renstra_id : $indicator->sasaran->tujuan->renstra_id))
        ->delete(route('indicators.destroy', $indicator))
        ->assertRedirect(route('renstras.show', $indicator->tujuan_id ? $indicator->tujuan->renstra_id : $indicator->sasaran->tujuan->renstra_id))
        ->assertSessionHas('success', 'Indikator berhasil dihapus.');

    // Assert indicator is missing
    $this->assertDatabaseMissing('indicators', ['id' => $indicator->id]);

    // Assert targets are missing (cascade on delete)
    $this->assertDatabaseMissing('indicator_targets', ['indicator_id' => $indicator->id]);
});
