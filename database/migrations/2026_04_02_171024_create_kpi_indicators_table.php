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
        Schema::create('kpi_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('kpi_groups')->onDelete('cascade');
            $table->foreignId('parent_indicator_id')->nullable()->constrained('kpi_indicators')->onDelete('cascade');
            $table->text('name');
            $table->string('unit', 100)->nullable();
            $table->boolean('is_category')->default(false);
            $table->string('baseline_value', 32)->nullable();
            $table->timestamps();

            $table->index('group_id', 'idx_kpi_indicators_group_id');
            $table->index('parent_indicator_id', 'idx_kpi_indicators_parent_id');
        });

        DB::statement('ALTER TABLE kpi_indicators ADD CONSTRAINT chk_kpi_indicators_category_no_unit CHECK (NOT is_category OR (is_category AND unit IS NULL AND baseline_value IS NULL))');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kpi_indicators');
    }
};
