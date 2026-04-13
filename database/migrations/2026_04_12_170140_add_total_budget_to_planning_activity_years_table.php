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
        Schema::table('planning_activity_years', function (Blueprint $table) {
            $table->decimal('total_budget', 20, 2)->nullable()->after('budget');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('planning_activity_years', function (Blueprint $table) {
            $table->dropColumn('total_budget');
        });
    }
};
