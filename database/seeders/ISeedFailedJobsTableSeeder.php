<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedFailedJobsTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('failed_jobs')->delete();
        Schema::enableForeignKeyConstraints();

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('failed_jobs', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM failed_jobs;");
        }
    }
}
