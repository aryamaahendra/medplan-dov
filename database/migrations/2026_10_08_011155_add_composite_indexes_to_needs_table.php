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
            $table->index(['need_group_id', 'status'], 'idx_needs_group_status');
            $table->index(['need_group_id', 'organizational_unit_id'], 'idx_needs_group_unit');
            $table->index(['need_group_id', 'need_type_id'], 'idx_needs_group_type');
            $table->index(['need_group_id', 'is_priority'], 'idx_needs_group_priority');
            $table->index(['need_group_id', 'approved_by_director_at'], 'idx_needs_group_approved');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('needs', function (Blueprint $table) {
            $table->dropIndex('idx_needs_group_status');
            $table->dropIndex('idx_needs_group_unit');
            $table->dropIndex('idx_needs_group_type');
            $table->dropIndex('idx_needs_group_priority');
            $table->dropIndex('idx_needs_group_approved');
        });
    }
};
