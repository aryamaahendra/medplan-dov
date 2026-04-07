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
        Schema::create('need_checklist_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('need_id')->constrained()->cascadeOnDelete();
            $table->foreignId('checklist_question_id')->constrained()->cascadeOnDelete();
            $table->string('answer');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['need_id', 'checklist_question_id'], 'need_checklist_answer_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('need_checklist_answers');
    }
};
