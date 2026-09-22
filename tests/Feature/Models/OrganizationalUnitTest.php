<?php

use App\Models\OrganizationalUnit;

test('organizational unit can be created via factory', function () {
    $unit = OrganizationalUnit::factory()->create([
        'name' => 'Biro Perencanaan',
        'code' => 'BP-01',
    ]);

    expect($unit->name)->toBe('Biro Perencanaan')
        ->and($unit->code)->toBe('BP-01');
    $this->assertModelExists($unit);
});
