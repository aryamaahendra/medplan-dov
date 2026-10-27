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
            $table->foreignId('source_need_id')
                ->nullable()
                ->after('need_group_id')
                ->constrained('needs')
                ->nullOnDelete();

            $table->index(['source_need_id', 'need_group_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('needs', function (Blueprint $table) {
            $table->dropForeign(['source_need_id']);
            $table->dropIndex(['source_need_id', 'need_group_id']);
            $table->dropColumn('source_need_id');
        });
    }
};
