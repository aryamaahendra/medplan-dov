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
        Schema::create('planning_activity_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('planning_version_id')->constrained('planning_versions')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('planning_activity_versions')->nullOnDelete();
            $table->string('code')->nullable()->index();
            $table->string('type')->nullable();
            $table->text('name');
            $table->string('full_code')->nullable();
            $table->string('perangkat_daerah')->nullable();
            $table->text('keterangan')->nullable();
            $table->integer('sort_order')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planning_activity_versions');
    }
};
