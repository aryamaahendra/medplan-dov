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
        Schema::table('needs', function (Blueprint $table) {
            $table->string('urgency', 20)->default('medium')->after('total_price');
            $table->string('impact', 20)->default('medium')->after('urgency');
            $table->boolean('is_priority')->default(false)->after('impact');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('needs', function (Blueprint $table) {
            $table->dropColumn(['urgency', 'impact', 'is_priority']);
        });
    }
};
