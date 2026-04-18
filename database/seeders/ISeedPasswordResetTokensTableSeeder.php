<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ISeedPasswordResetTokensTableSeeder extends Seeder
{
    /**
     * Auto generated seed file
     *
     * @return void
     */
    public function run()
    {
        Schema::disableForeignKeyConstraints();
        \DB::table('password_reset_tokens')->delete();
        Schema::enableForeignKeyConstraints();

        if (config('database.default') === 'pgsql') {
            \DB::statement("SELECT setval(pg_get_serial_sequence('password_reset_tokens', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM password_reset_tokens;");
        }
    }
}
