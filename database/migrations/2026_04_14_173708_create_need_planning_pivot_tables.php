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
        Schema::create('need_planning_activity_version', function (Blueprint $table) {
            $table->id();
            $table->foreignId('need_id')->constrained()->cascadeOnDelete();
            $table->foreignId('planning_activity_version_id')
                ->constrained('planning_activity_versions')
                ->cascadeOnDelete()
                ->name('need_pav_planning_activity_version_id_foreign');
            $table->timestamps();
        });

        Schema::create('need_planning_activity_indicator', function (Blueprint $table) {
            $table->id();
            $table->foreignId('need_id')->constrained()->cascadeOnDelete();
            $table->foreignId('planning_activity_indicator_id')
                ->constrained('planning_activity_indicators')
                ->cascadeOnDelete()
                ->name('need_pai_planning_activity_indicator_id_foreign');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('need_planning_activity_version');
        Schema::dropIfExists('need_planning_activity_indicator');
    }
};
