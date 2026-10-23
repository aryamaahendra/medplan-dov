<?php

use App\Actions\Need\NeedProposalEngine;
use App\Enums\Impact;
use App\Enums\Urgency;
use App\Models\FundingSource;
use App\Models\Need;
use App\Models\NeedAttachment;
use App\Models\NeedGroup;
use App\Models\NeedType;
use App\Models\OrganizationalUnit;
use App\Models\Sasaran;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->seed(RolesAndPermissionsSeeder::class);
    Storage::fake(config('filesystems.attachments_disk', 'local'));

    $this->unit = OrganizationalUnit::factory()->create();
    $this->group = NeedGroup::factory()->create(['is_active' => true, 'year' => 2026]);
    $this->type = NeedType::factory()->create();
    $this->sasaran = Sasaran::factory()->create();

    $this->standardUser = User::factory()->create(['organizational_unit_id' => $this->unit->id]);
    $this->standardUser->givePermissionTo([
        'view needs',
        'create needs',
        'update needs',
        'update need tab general',
        'update need tab detail',
        'create need-attachments',
        'view need-attachments',
    ]);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super-admin');
});

test('standard user submitting arbitrary string values in funding_source_ids triggers validation error and does not create funding sources', function () {
    $initialCount = FundingSource::count();

    $payload = [
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'need_type_id' => $this->type->id,
        'year' => 2026,
        'title' => 'Usulan Server Standard',
        'volume' => 1,
        'unit' => 'unit',
        'unit_price' => 5000000,
        'total_price' => 5000000,
        'urgency' => Urgency::Medium->value,
        'impact' => Impact::Medium->value,
        'sasaran_ids' => [$this->sasaran->id],
        'detail' => [
            'funding_source_ids' => ['Arbitrary Dynamic Source', 'Another Rogue Source'],
        ],
    ];

    $response = $this->actingAs($this->standardUser)
        ->post(route('needs.store'), $payload);

    $response->assertSessionHasErrors(['detail.funding_source_ids.0', 'detail.funding_source_ids.1']);
    expect(FundingSource::count())->toBe($initialCount);
    expect(FundingSource::where('name', 'Arbitrary Dynamic Source')->exists())->toBeFalse();
});

test('standard user can submit valid existing funding source ids', function () {
    $source = FundingSource::factory()->create(['name' => 'APBD 2026']);

    $payload = [
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'need_type_id' => $this->type->id,
        'year' => 2026,
        'title' => 'Usulan Server Valid',
        'volume' => 1,
        'unit' => 'unit',
        'unit_price' => 5000000,
        'total_price' => 5000000,
        'urgency' => Urgency::Medium->value,
        'impact' => Impact::Medium->value,
        'sasaran_ids' => [$this->sasaran->id],
        'detail' => [
            'funding_source_ids' => [(string) $source->id],
        ],
    ];

    $response = $this->actingAs($this->standardUser)
        ->post(route('needs.store'), $payload);

    $response->assertSessionHasNoErrors();
    $need = Need::where('title', 'Usulan Server Valid')->first();
    expect($need)->not->toBeNull()
        ->and($need->detail->fundingSources->pluck('id')->all())->toBe([$source->id]);
});

test('super admin can submit free-text funding source which creates a new master record', function () {
    $payload = [
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'need_type_id' => $this->type->id,
        'year' => 2026,
        'title' => 'Usulan Super Admin Source',
        'volume' => 1,
        'unit' => 'unit',
        'unit_price' => 5000000,
        'total_price' => 5000000,
        'urgency' => Urgency::Medium->value,
        'impact' => Impact::Medium->value,
        'sasaran_ids' => [$this->sasaran->id],
        'detail' => [
            'funding_source_ids' => ['Hibah Khusus Admin 2026'],
        ],
    ];

    $response = $this->actingAs($this->superAdmin)
        ->post(route('needs.store'), $payload);

    $response->assertSessionHasNoErrors();
    expect(FundingSource::where('name', 'Hibah Khusus Admin 2026')->exists())->toBeTrue();
});

test('NeedProposalEngine resolveFundingSourceIds strips non-numeric strings when actor is unauthorized', function () {
    $engine = app(NeedProposalEngine::class);
    $existing = FundingSource::factory()->create(['name' => 'Sumber Sah']);

    $resolved = $engine->resolveFundingSourceIds([
        'Rogue String',
        (string) $existing->id,
        'Another Rogue String',
    ], $this->standardUser);

    expect($resolved)->toBe([$existing->id]);
    expect(FundingSource::where('name', 'Rogue String')->exists())->toBeFalse();
    expect(FundingSource::where('name', 'Another Rogue String')->exists())->toBeFalse();
});

test('NeedProposalEngine resolveFundingSourceIds creates records when actor is super admin', function () {
    $engine = app(NeedProposalEngine::class);

    $resolved = $engine->resolveFundingSourceIds([
        'Sumber Legal Admin',
    ], $this->superAdmin);

    expect($resolved)->toHaveCount(1);
    expect(FundingSource::where('name', 'Sumber Legal Admin')->exists())->toBeTrue();
});

test('UpdateNeedRequest validates technical specification attachments when user has update need tab detail permission', function () {
    $need = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
        'status' => Need::STATUS_DRAFT,
    ]);

    // Give user update need tab detail, but NOT update need tab lampiran
    $user = User::factory()->create(['organizational_unit_id' => $this->unit->id]);
    $user->givePermissionTo([
        'view needs',
        'update needs',
        'update need tab detail',
    ]);

    $disallowedFile = UploadedFile::fake()->create('malicious.exe', 500, 'application/x-msdownload');

    $response = $this->actingAs($user)
        ->put(route('needs.update', $need), [
            'detail' => [
                'background' => 'Latar belakang baru',
            ],
            'technical_specification_attachments' => [$disallowedFile],
        ]);

    // Should fail file validation because technical_specification_attachments is mapped under update need tab detail
    $response->assertSessionHasErrors(['technical_specification_attachments.0']);
});

test('NeedAttachmentController store enforces allowed categories', function () {
    $need = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
    ]);

    $file = UploadedFile::fake()->create('test.pdf', 100, 'application/pdf');

    $response = $this->actingAs($this->standardUser)
        ->post(route('needs.attachments.store', $need), [
            'file' => $file,
            'category' => 'invalid_category_hack',
            'display_name' => 'Dokumen Tes',
        ]);

    $response->assertSessionHasErrors(['category']);
});

test('NeedAttachmentController store derives extension and file size directly from server received file', function () {
    $need = Need::factory()->create([
        'need_group_id' => $this->group->id,
        'organizational_unit_id' => $this->unit->id,
    ]);

    $actualSizeKb = 250;
    $file = UploadedFile::fake()->create('authentic.pdf', $actualSizeKb, 'application/pdf');

    $response = $this->actingAs($this->standardUser)
        ->post(route('needs.attachments.store', $need), [
            'file' => $file,
            'category' => 'technical_specifications',
            'display_name' => 'Display Authentic',
            'extension' => 'exe', // Spoofed client input
            'file_size' => 99999999, // Spoofed client input
        ]);

    $response->assertSessionHasNoErrors();

    $attachment = NeedAttachment::where('need_id', $need->id)->first();
    expect($attachment)->not->toBeNull()
        ->and($attachment->category)->toBe('technical_specifications')
        ->and($attachment->extension)->toBe('pdf')
        ->and($attachment->file_size)->toBe($file->getSize())
        ->and($attachment->mime_type)->toBe('application/pdf');
});
