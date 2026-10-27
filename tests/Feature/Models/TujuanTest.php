<?php

use App\Models\Tujuan;

test('tujuan can be created via factory', function () {
    $tujuan = Tujuan::factory()->create([
        'name' => 'Meningkatkan Tata Kelola',
    ]);

    expect($tujuan->name)->toBe('Meningkatkan Tata Kelola');
    $this->assertModelExists($tujuan);
});
