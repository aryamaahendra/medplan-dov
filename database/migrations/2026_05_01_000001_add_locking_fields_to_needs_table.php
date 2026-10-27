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
        Schema::table('needs', function (Blueprint $table) {
            $table->boolean('is_locked')->nullable()->after('approved_by_director_at');
            $table->timestamp('locked_at')->nullable()->after('is_locked');
            $table->foreignId('locked_by_user_id')->nullable()->constrained('users')->nullOnDelete()->after('locked_at');
            $table->string('lock_reason')->nullable()->after('locked_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('needs', function (Blueprint $table) {
            $table->dropForeign(['locked_by_user_id']);
            $table->dropColumn(['is_locked', 'locked_at', 'locked_by_user_id', 'lock_reason']);
        });
    }
};
