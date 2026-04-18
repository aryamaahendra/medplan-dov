<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedNeedTypesTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('need_types')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('need_types')->insert([

            0 => [
                'id' => 1,
                'name' => 'SDM',
                'code' => 'SDM',
                'description' => 'Jenis kebutuhan SDM',
                'is_active' => true,
                'order_column' => 1,
                'created_at' => '2026-04-13 11:22:20',
                'updated_at' => '2026-04-13 11:22:20',
                'deleted_at' => null,
            ],
            1 => [
                'id' => 2,
                'name' => 'ALKES',
                'code' => 'ALKES',
                'description' => 'Jenis kebutuhan ALKES',
                'is_active' => true,
                'order_column' => 2,
                'created_at' => '2026-04-13 11:22:20',
                'updated_at' => '2026-04-13 11:22:20',
                'deleted_at' => null,
            ],
            2 => [
                'id' => 3,
                'name' => 'PERSEDIAAN',
                'code' => 'PERSEDIAAN',
                'description' => 'Jenis kebutuhan PERSEDIAAN',
                'is_active' => true,
                'order_column' => 3,
                'created_at' => '2026-04-13 11:22:20',
                'updated_at' => '2026-04-13 11:22:20',
                'deleted_at' => null,
            ],
            3 => [
                'id' => 4,
                'name' => 'SARANA',
                'code' => 'SARANA',
                'description' => 'Jenis kebutuhan SARANA',
                'is_active' => true,
                'order_column' => 4,
                'created_at' => '2026-04-13 11:22:20',
                'updated_at' => '2026-04-13 11:22:20',
                'deleted_at' => null,
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('need_types', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM need_types;");
        }
    }
}
