<?php

declare(strict_types=1);

use App\Enums\PlanningActivityType;
use App\Jobs\CalculateActivityBudgetJob;
use App\Models\PlanningActivityVersion;
use App\Models\PlanningActivityYear;
use App\Models\PlanningVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->admin()->create();
});
test('can recalculate planning version activity budget', function () {
    Queue::fake([CalculateActivityBudgetJob::class]);

    $version = PlanningVersion::factory()->create([
        'year_start' => 2026,
        'year_end' => 2026,
    ]);

    $activity = PlanningActivityVersion::factory()->create([
        'planning_version_id' => $version->id,
        'type' => PlanningActivityType::Subkegiatan,
    ]);

    PlanningActivityYear::factory()->create([
        'yearable_id' => $activity->id,
        'yearable_type' => PlanningActivityVersion::class,
        'year' => 2026,
        'budget' => 5000000,
    ]);

    $response = $this->actingAs($this->user)
        ->from(route('planning-versions.activities.index', $version))
        ->post(route('planning-versions.activities.recalculate', $version));

    $response->assertRedirect(route('planning-versions.activities.index', $version));
    $response->assertSessionHas('success', 'Penghitungan ulang anggaran telah dijadwalkan.');

    Queue::assertPushed(CalculateActivityBudgetJob::class);
});
