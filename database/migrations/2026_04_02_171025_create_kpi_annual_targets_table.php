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
        Schema::create('kpi_annual_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('indicator_id')->constrained('kpi_indicators')->onDelete('cascade');
            $table->smallInteger('year');
            $table->string('target_value', 32)->nullable();
            $table->timestamps();

            $table->unique(['indicator_id', 'year'], 'uq_kpi_annual_targets_indicator_year');
            $table->index('indicator_id', 'idx_kpi_annual_targets_indicator_id');
        });

        DB::unprepared("
            CREATE OR REPLACE FUNCTION fn_check_target_year_in_group_range()
            RETURNS TRIGGER LANGUAGE plpgsql AS $$
            DECLARE
                v_start_year SMALLINT;
                v_end_year   SMALLINT;
            BEGIN
                SELECT g.start_year, g.end_year
                INTO   v_start_year, v_end_year
                FROM   kpi_groups     g
                JOIN   kpi_indicators i ON i.group_id = g.id
                WHERE  i.id = NEW.indicator_id;

                IF NEW.year < v_start_year OR NEW.year > v_end_year THEN
                    RAISE EXCEPTION
                        'Target year % is outside group range [%, %].',
                        NEW.year, v_start_year, v_end_year;
                END IF;

                RETURN NEW;
            END;
            $$;

            CREATE TRIGGER trg_kpi_annual_targets_year_range
            BEFORE INSERT OR UPDATE ON kpi_annual_targets
            FOR EACH ROW EXECUTE FUNCTION fn_check_target_year_in_group_range();
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS trg_kpi_annual_targets_year_range ON kpi_annual_targets');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_check_target_year_in_group_range()');
        Schema::dropIfExists('kpi_annual_targets');
    }
};
