<?php

use App\Models\PlanningActivityVersion;

test('planning activity version can be created via factory', function () {
    $activity = PlanningActivityVersion::factory()->create([
        'name' => 'Program Pengembangan Sistem',
    ]);

    expect($activity->name)->toBe('Program Pengembangan Sistem');
    $this->assertModelExists($activity);
});
