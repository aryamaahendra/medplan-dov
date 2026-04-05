<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('strategic_service_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('year');
            $table->string('strategic_program', 255);
            $table->text('service_plan');
            $table->text('target');
            $table->text('policy_direction');
            $table->timestamps();
            $table->softDeletes();
        });

        // Add check constraint
        DB::statement('ALTER TABLE strategic_service_plans ADD CONSTRAINT chk_year_valid CHECK (year >= 2000)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('strategic_service_plans');
    }
};
