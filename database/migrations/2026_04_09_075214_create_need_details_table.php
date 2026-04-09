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
        Schema::create('need_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('need_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('background')->nullable();
            $table->text('purpose_and_objectives')->nullable();
            $table->text('target_objective')->nullable();
            $table->text('procurement_organization_name')->nullable();
            $table->text('funding_source_and_estimated_cost')->nullable();
            $table->text('implementation_period')->nullable();
            $table->text('expert_or_skilled_personnel')->nullable();
            $table->text('technical_specifications')->nullable();
            $table->text('training')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('need_details');
    }
};
