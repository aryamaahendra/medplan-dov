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
        Schema::create('planning_revision_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('planning_version_id')->constrained('planning_versions')->cascadeOnDelete();
            $table->string('code')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('parent_group_id')->nullable()->constrained('planning_revision_groups')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planning_revision_groups');
    }
};
