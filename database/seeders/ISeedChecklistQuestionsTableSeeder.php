<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedChecklistQuestionsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('checklist_questions')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('checklist_questions')->insert([

            0 => [
                'id' => 1,
                'question' => 'Usulan terkait langsung dengan tujuan dalam RSB ?',
                'description' => null,
                'is_active' => true,
                'order_column' => 1,
                'created_at' => '2026-04-13 11:45:13',
                'updated_at' => '2026-04-13 11:45:13',
                'deleted_at' => null,
            ],
            1 => [
                'id' => 2,
                'question' => 'Usulan terkait langsung dengan sasaran strategis dalam RSB ?',
                'description' => null,
                'is_active' => true,
                'order_column' => 2,
                'created_at' => '2026-04-13 11:45:29',
                'updated_at' => '2026-04-13 11:45:29',
                'deleted_at' => null,
            ],
            2 => [
                'id' => 3,
                'question' => 'Ada indikator kinerja yang relevan ?',
                'description' => null,
                'is_active' => true,
                'order_column' => 3,
                'created_at' => '2026-04-13 11:45:42',
                'updated_at' => '2026-04-13 11:45:42',
                'deleted_at' => null,
            ],
            3 => [
                'id' => 4,
                'question' => 'Usulan termasuk dalam program yang sudah direncakanakan di RSB ?',
                'description' => null,
                'is_active' => true,
                'order_column' => 4,
                'created_at' => '2026-04-13 11:45:55',
                'updated_at' => '2026-04-13 11:45:55',
                'deleted_at' => null,
            ],
            4 => [
                'id' => 5,
                'question' => 'Usulan termasuk prioritas utama ?',
                'description' => null,
                'is_active' => true,
                'order_column' => 5,
                'created_at' => '2026-04-13 11:46:09',
                'updated_at' => '2026-04-13 11:46:09',
                'deleted_at' => null,
            ],
            5 => [
                'id' => 6,
                'question' => 'Usulan mendukung Indikator Kinerja Kunci (IKK) di RSB ?',
                'description' => null,
                'is_active' => true,
                'order_column' => 6,
                'created_at' => '2026-04-13 11:46:24',
                'updated_at' => '2026-04-13 11:46:24',
                'deleted_at' => null,
            ],
            6 => [
                'id' => 7,
                'question' => 'Usulan mendukung rencana strategis pengembangan layanan rumah sakit ?',
                'description' => null,
                'is_active' => true,
                'order_column' => 7,
                'created_at' => '2026-04-13 11:46:45',
                'updated_at' => '2026-04-13 11:47:11',
                'deleted_at' => null,
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('checklist_questions', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM checklist_questions;");
        }
    }
}
