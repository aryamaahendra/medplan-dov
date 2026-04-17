<?php

use App\Models\Need;
use App\Models\NeedDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guest cannot export need to pdf', function () {
    $need = Need::factory()->create();

    $this->get(route('needs.export-pdf', $need))
        ->assertRedirect(route('login'));
});

test('authenticated user can export need to pdf', function () {
    $user = User::factory()->create();
    $need = Need::factory()->create(['title' => 'Test Need']);
    NeedDetail::factory()->create(['need_id' => $need->id]);

    $response = $this->actingAs($user)
        ->get(route('needs.export-pdf', $need));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/pdf');
    $response->assertHeader('Content-Disposition', 'attachment; filename="usulan-Test Need.pdf"');
});

test('authenticated user can export need to pdf with custom settings', function () {
    $user = User::factory()->create();
    $signer = User::factory()->create(['name' => 'Signer Name', 'nip' => '12345']);
    $need = Need::factory()->create(['title' => 'Custom Need']);
    NeedDetail::factory()->create(['need_id' => $need->id]);

    $response = $this->actingAs($user)
        ->get(route('needs.export-pdf', [
            'need' => $need,
            'signer_id' => $signer->id,
            'paper_size' => 'f4',
            'm_top' => 10,
            'm_bottom' => 10,
            'm_left' => 15,
            'm_right' => 15,
        ]));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/pdf');
});
