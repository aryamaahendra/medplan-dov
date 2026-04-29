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
        Schema::table('need_details', function (Blueprint $table) {
            $table->dropColumn('procurement_organization_name');
            $table->string('kldi')->nullable()->after('target_objective');
            $table->string('satker_skpd')->nullable()->after('kldi');
            $table->foreignId('kpa_id')->nullable()->after('satker_skpd')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('need_details', function (Blueprint $table) {
            $table->text('procurement_organization_name')->nullable()->after('target_objective');
            $table->dropConstrainedForeignId('kpa_id');
            $table->dropColumn(['kldi', 'satker_skpd']);
        });
    }
};
