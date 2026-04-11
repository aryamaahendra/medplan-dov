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
        Schema::create('planning_activity_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('planning_activity_version_id')->constrained('planning_activity_versions')->cascadeOnDelete();
            $table->text('name');
            $table->string('baseline')->nullable();
            $table->string('unit')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planning_activity_indicators');
    }
};
