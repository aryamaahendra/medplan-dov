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
        Schema::create('planning_activity_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('planning_activity_version_id')->constrained('planning_activity_versions')->cascadeOnDelete();
            $table->integer('year');
            $table->string('target');
            $table->decimal('budget', 20, 2);
            $table->timestamps();

            $table->unique(['planning_activity_version_id', 'year'], 'planning_activity_year_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planning_activity_years');
    }
};
