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
        Schema::table('needs', function (Blueprint $table) {
            $table->decimal('approved_volume', 15, 4)->nullable();
            $table->decimal('approved_unit_price', 15, 2)->nullable();
            $table->decimal('approved_total_price', 15, 2)->nullable();
            $table->boolean('is_recommended_for_next_cycle')->default(false);
            $table->decimal('recommended_volume', 15, 4)->nullable();

            $table->index(['need_group_id', 'is_recommended_for_next_cycle'], 'idx_needs_group_recommended');
        });

        DB::transaction(function (): void {
            $this->backfill();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::transaction(function (): void {
            $this->rollbackBackfill();
        });

        Schema::table('needs', function (Blueprint $table): void {
            $table->dropIndex('idx_needs_group_recommended');
            $table->dropColumn([
                'approved_volume',
                'approved_unit_price',
                'approved_total_price',
                'is_recommended_for_next_cycle',
                'recommended_volume',
            ]);
        });
    }

    /**
     * Idempotent data backfill for canonical lifecycle states and approved amounts.
     */
    public function backfill(): void
    {
        DB::transaction(function (): void {
            /**
             * Transition historically approved proposals to 'approved' and populate approved figures from requested.
             */
            DB::table('needs')
                ->whereNotNull('approved_by_director_at')
                ->update([
                    'status' => 'approved',
                    'approved_volume' => DB::raw('COALESCE(approved_volume, volume)'),
                    'approved_unit_price' => DB::raw('COALESCE(approved_unit_price, unit_price)'),
                    'approved_total_price' => DB::raw('COALESCE(approved_total_price, total_price)'),
                ]);

            /**
             * Transition legacy unreviewed proposals previously marked 'approved' (representing submitted) to 'submitted'.
             */
            DB::table('needs')
                ->where('status', 'approved')
                ->whereNull('approved_by_director_at')
                ->update([
                    'status' => 'submitted',
                ]);

            /**
             * Transition unapproved proposals with non-empty review notes to 'revision'.
             */
            DB::table('needs')
                ->whereNull('approved_by_director_at')
                ->where('status', 'draft')
                ->whereNotNull('notes')
                ->whereRaw("TRIM(notes) != ''")
                ->update([
                    'status' => 'revision',
                ]);
        });
    }

    /**
     * Reversible rollback restoring legacy status semantics.
     */
    public function rollbackBackfill(): void
    {
        DB::transaction(function (): void {
            DB::table('needs')
                ->where('status', 'submitted')
                ->update(['status' => 'approved']);

            DB::table('needs')
                ->where('status', 'revision')
                ->update(['status' => 'draft']);
        });
    }
};
