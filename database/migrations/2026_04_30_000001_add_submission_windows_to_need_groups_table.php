<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('need_groups', function (Blueprint $table) {
            $table->timestamp('submission_start_at')->nullable()->after('is_active');
            $table->timestamp('submission_end_at')->nullable()->after('submission_start_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('need_groups', function (Blueprint $table) {
            $table->dropColumn(['submission_start_at', 'submission_end_at']);
        });
    }
};
