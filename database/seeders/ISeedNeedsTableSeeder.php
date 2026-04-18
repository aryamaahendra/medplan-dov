<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedNeedsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('needs')->delete();
        Schema::enableForeignKeyConstraints();

        \DB::table('needs')->insert([

            0 => [
                'id' => 3,
                'organizational_unit_id' => 9,
                'need_type_id' => 1,
                'year' => 2026,
                'title' => 'Dokter Spesialis Jiwa',
                'description' => null,
                'current_condition' => null,
                'required_condition' => null,
                'volume' => '1.0000',
                'unit' => 'orang',
                'unit_price' => '180000000.00',
                'total_price' => '180000000.00',
                'status' => 'draft',
                'created_at' => '2026-04-13 12:08:39',
                'updated_at' => '2026-04-14 16:12:52',
                'deleted_at' => null,
                'urgency' => 'medium',
                'impact' => 'medium',
                'is_priority' => false,
                'need_group_id' => 1,
                'checklist_percentage' => '66.67',
                'notes' => '{"time":1776183170008,"blocks":[],"version":"2.31.6"}',
                'approved_by_director_at' => null,
            ],
            1 => [
                'id' => 2,
                'organizational_unit_id' => 12,
                'need_type_id' => 3,
                'year' => 2026,
                'title' => 'Obat-Obatan',
                'description' => null,
                'current_condition' => null,
                'required_condition' => null,
                'volume' => '1.0000',
                'unit' => 'paket',
                'unit_price' => '8000000000.00',
                'total_price' => '8000000000.00',
                'status' => 'draft',
                'created_at' => '2026-04-13 12:05:00',
                'updated_at' => '2026-04-14 16:13:13',
                'deleted_at' => null,
                'urgency' => 'high',
                'impact' => 'high',
                'is_priority' => true,
                'need_group_id' => 1,
                'checklist_percentage' => '0.00',
                'notes' => '{"time":1776183190778,"blocks":[{"id":"g6beVYS0O0","type":"paragraph","data":{"text":"Hello World"}}],"version":"2.31.6"}',
                'approved_by_director_at' => '2026-04-14 16:13:13',
            ],
            2 => [
                'id' => 1,
                'organizational_unit_id' => 2,
                'need_type_id' => 4,
                'year' => 2026,
                'title' => 'Pembangunan Gedung PICU',
                'description' => null,
                'current_condition' => 'Belum tersedia',
                'required_condition' => 'Harus tersedia',
                'volume' => '1.0000',
                'unit' => 'unit',
                'unit_price' => '1500000000.00',
                'total_price' => '1500000000.00',
                'status' => 'draft',
                'created_at' => '2026-04-13 11:53:32',
                'updated_at' => '2026-04-14 08:55:39',
                'deleted_at' => null,
                'urgency' => 'high',
                'impact' => 'high',
                'is_priority' => true,
                'need_group_id' => 1,
                'checklist_percentage' => '71.43',
                'notes' => null,
                'approved_by_director_at' => null,
            ],
        ]);

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('needs', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM needs;");
        }
    }
}
