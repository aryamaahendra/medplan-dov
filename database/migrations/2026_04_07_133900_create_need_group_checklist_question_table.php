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
        Schema::create('need_group_checklist_question', function (Blueprint $table) {
            $table->id();
            $table->foreignId('need_group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('checklist_question_id')->constrained()->cascadeOnDelete();
            $table->integer('order_column')->default(0);
            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['need_group_id', 'checklist_question_id'], 'need_group_question_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('need_group_checklist_question');
    }
};
