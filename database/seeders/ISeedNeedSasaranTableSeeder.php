<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedNeedSasaranTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('need_sasaran')->delete();

        \DB::table('need_sasaran')->insert([
            0 => [
                'id' => 1,
                'need_id' => 1,
                'sasaran_id' => 2,
                'created_at' => null,
                'updated_at' => null,
            ],
            1 => [
                'id' => 2,
                'need_id' => 1,
                'sasaran_id' => 3,
                'created_at' => null,
                'updated_at' => null,
            ],
            2 => [
                'id' => 3,
                'need_id' => 1,
                'sasaran_id' => 1,
                'created_at' => null,
                'updated_at' => null,
            ],
            3 => [
                'id' => 4,
                'need_id' => 1,
                'sasaran_id' => 5,
                'created_at' => null,
                'updated_at' => null,
            ],
            4 => [
                'id' => 5,
                'need_id' => 2,
                'sasaran_id' => 4,
                'created_at' => null,
                'updated_at' => null,
            ],
            5 => [
                'id' => 6,
                'need_id' => 3,
                'sasaran_id' => 5,
                'created_at' => null,
                'updated_at' => null,
            ],
            6 => [
                'id' => 7,
                'need_id' => 3,
                'sasaran_id' => 7,
                'created_at' => null,
                'updated_at' => null,
            ],
        ]);

    }
}
