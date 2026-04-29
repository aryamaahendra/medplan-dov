<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('need_detail_funding_source', function (Blueprint $table) {
            $table->id();
            $table->foreignId('need_detail_id')->constrained()->cascadeOnDelete();
            $table->foreignId('funding_source_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        // Migrate data
        $details = DB::table('need_details')->whereNotNull('funding_source_id')->get();
        foreach ($details as $detail) {
            DB::table('need_detail_funding_source')->insert([
                'need_detail_id' => $detail->id,
                'funding_source_id' => $detail->funding_source_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('need_details', function (Blueprint $table) {
            $table->dropConstrainedForeignId('funding_source_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('need_details', function (Blueprint $table) {
            $table->foreignId('funding_source_id')->nullable()->constrained('funding_sources')->nullOnDelete();
        });

        // Migrate back (pick first one)
        $pivots = DB::table('need_detail_funding_source')
            ->orderBy('id')
            ->get()
            ->groupBy('need_detail_id');

        foreach ($pivots as $detailId => $items) {
            DB::table('need_details')
                ->where('id', $detailId)
                ->update(['funding_source_id' => $items->first()->funding_source_id]);
        }

        Schema::dropIfExists('need_detail_funding_source');
    }
};
