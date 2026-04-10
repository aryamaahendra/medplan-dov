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
        Schema::create('planning_activities', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable()->index();
            $table->text('name');
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('planning_activities')
                ->cascadeOnDelete();
            $table->enum('type', ['program', 'activity', 'sub_activity', 'output']);
            $table->string('full_code')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planning_activities');
    }
};
