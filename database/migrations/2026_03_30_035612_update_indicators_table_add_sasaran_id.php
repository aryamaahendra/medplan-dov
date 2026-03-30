<?php

use App\Models\Sasaran;
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
        Schema::table('indicators', function (Blueprint $table) {
            $table->foreignId('tujuan_id')->nullable()->change();
            $table->foreignIdFor(Sasaran::class)->nullable()->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('indicators', function (Blueprint $table) {
            $table->dropForeign(['sasaran_id']);
            $table->dropColumn('sasaran_id');
            $table->foreignId('tujuan_id')->nullable(false)->change();
        });
    }
};
