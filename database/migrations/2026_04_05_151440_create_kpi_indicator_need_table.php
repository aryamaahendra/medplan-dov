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
        Schema::create('kpi_indicator_need', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kpi_indicator_id')->constrained()->cascadeOnDelete();
            $table->foreignId('need_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['kpi_indicator_id', 'need_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kpi_indicator_need');
    }
};
