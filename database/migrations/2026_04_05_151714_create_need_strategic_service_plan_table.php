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
        Schema::create('need_strategic_service_plan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('need_id')->constrained()->cascadeOnDelete();
            $table->foreignId('strategic_service_plan_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['need_id', 'strategic_service_plan_id'], 'need_ssp_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('need_strategic_service_plan');
    }
};
