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
        Schema::create('kpi_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->smallInteger('start_year');
            $table->smallInteger('end_year');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::statement('ALTER TABLE kpi_groups ADD CONSTRAINT chk_kpi_groups_year_range CHECK (end_year >= start_year)');
        DB::statement('CREATE UNIQUE INDEX uq_kpi_groups_single_active ON kpi_groups (is_active) WHERE is_active = TRUE');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kpi_groups');
    }
};
