<?php

use App\Enums\UserRole;
use App\Models\Need;
use App\Models\NeedDetail;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

test('guest cannot export need to pdf', function () {
    $need = Need::factory()->create();

    $this->get(route('needs.export-pdf', $need))
        ->assertRedirect(route('login'));
});

describe('authorization', function () {
    beforeEach(function () {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->parentUnit = OrganizationalUnit::factory()->create(['name' => 'Parent Unit']);
        $this->unit = OrganizationalUnit::factory()->create([
            'name' => 'Child Unit',
            'parent_id' => $this->parentUnit->id,
        ]);
        $this->otherUnit = OrganizationalUnit::factory()->create(['name' => 'Other Unit']);

        $this->need = Need::factory()->create([
            'title' => 'Test Need',
            'organizational_unit_id' => $this->unit->id,
        ]);
        NeedDetail::factory()->create(['need_id' => $this->need->id]);
    });

    test('authorized user within originating unit can export need to pdf', function () {
        $user = User::factory()->create(['organizational_unit_id' => $this->unit->id]);
        $user->assignRole(UserRole::Staff->value);

        $response = $this->actingAs($user)
            ->get(route('needs.export-pdf', $this->need));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('Content-Disposition', 'attachment; filename=usulan-test-need.pdf');
    });

    test('authorized user in parent unit with descendant permission can export need to pdf', function () {
        $user = User::factory()->create(['organizational_unit_id' => $this->parentUnit->id]);
        $user->assignRole(UserRole::UnitHead->value);

        $response = $this->actingAs($user)
            ->get(route('needs.export-pdf', $this->need));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    });

    test('planner can export need to pdf regardless of unit', function () {
        $planner = User::factory()->create(['organizational_unit_id' => $this->otherUnit->id]);
        $planner->assignRole(UserRole::Planner->value);

        $response = $this->actingAs($planner)
            ->get(route('needs.export-pdf', $this->need));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    });

    test('user outside organizational scope receives 403 forbidden', function () {
        $outsideUser = User::factory()->create(['organizational_unit_id' => $this->otherUnit->id]);
        $outsideUser->assignRole(UserRole::Staff->value);

        $response = $this->actingAs($outsideUser)
            ->get(route('needs.export-pdf', $this->need));

        $response->assertForbidden();
    });
});

describe('parameter validation and sanitization', function () {
    beforeEach(function () {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->unit = OrganizationalUnit::factory()->create();
        $this->user = User::factory()->create(['organizational_unit_id' => $this->unit->id]);
        $this->user->assignRole(UserRole::Staff->value);
    });

    test('custom layout settings with valid values export successfully', function () {
        $signer = User::factory()->create(['name' => 'Signer Name', 'nip' => '12345']);
        $need = Need::factory()->create([
            'title' => 'Custom Need',
            'organizational_unit_id' => $this->unit->id,
        ]);
        NeedDetail::factory()->create(['need_id' => $need->id]);

        $response = $this->actingAs($this->user)
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
        $response->assertHeader('Content-Disposition', 'attachment; filename=usulan-custom-need.pdf');
    });

    test('non-numeric margin inputs default safely without exception or corrupted layout', function () {
        $need = Need::factory()->create([
            'title' => 'Injection Test Need',
            'organizational_unit_id' => $this->unit->id,
        ]);
        NeedDetail::factory()->create(['need_id' => $need->id]);

        $response = $this->actingAs($this->user)
            ->get(route('needs.export-pdf', [
                'need' => $need,
                'm_top' => '20mm; } body { display:none; }',
                'm_bottom' => 'invalid-margin',
                'm_left' => '<script>alert(1)</script>',
                'm_right' => '-10',
            ]));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    });

    test('invalid paper size defaults safely to a4', function () {
        $need = Need::factory()->create([
            'title' => 'Paper Size Test',
            'organizational_unit_id' => $this->unit->id,
        ]);
        NeedDetail::factory()->create(['need_id' => $need->id]);

        $response = $this->actingAs($this->user)
            ->get(route('needs.export-pdf', [
                'need' => $need,
                'paper_size' => 'evil-size-exec',
            ]));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
    });

    test('preview parameter returns inline stream with sanitized filename', function () {
        $need = Need::factory()->create([
            'title' => 'Preview Proposal Test',
            'organizational_unit_id' => $this->unit->id,
        ]);
        NeedDetail::factory()->create(['need_id' => $need->id]);

        $response = $this->actingAs($this->user)
            ->get(route('needs.export-pdf', [
                'need' => $need,
                'preview' => 1,
            ]));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('Content-Disposition', 'inline; filename=usulan-preview-proposal-test.pdf');
    });

    test('filenames are sanitized against CRLF, quotes, and empty slug fallback', function () {
        $need = Need::factory()->create([
            'title' => "Malicious\r\nTitle\"with quotes",
            'organizational_unit_id' => $this->unit->id,
        ]);
        NeedDetail::factory()->create(['need_id' => $need->id]);

        $response = $this->actingAs($this->user)
            ->get(route('needs.export-pdf', $need));

        $response->assertOk();
        $response->assertHeader('Content-Disposition', 'attachment; filename=usulan-malicious-titlewith-quotes.pdf');

        $emptyTitleNeed = Need::factory()->create([
            'title' => '???///',
            'organizational_unit_id' => $this->unit->id,
        ]);
        NeedDetail::factory()->create(['need_id' => $emptyTitleNeed->id]);

        $emptySlugResponse = $this->actingAs($this->user)
            ->get(route('needs.export-pdf', $emptyTitleNeed));

        $emptySlugResponse->assertOk();
        $emptySlugResponse->assertHeader('Content-Disposition', 'attachment; filename=usulan-'.$emptyTitleNeed->id.'.pdf');
    });
});
