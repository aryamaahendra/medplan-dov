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
        Schema::create('planning_versions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('fiscal_year');
            $table->integer('revision_no');
            $table->enum('status', ['draft', 'submitted', 'approved', 'archived'])->default('draft');
            $table->boolean('is_current')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planning_versions');
    }
};
