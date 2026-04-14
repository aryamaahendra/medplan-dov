<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ISeedSessionsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {

        \DB::table('sessions')->delete();

    }
}
