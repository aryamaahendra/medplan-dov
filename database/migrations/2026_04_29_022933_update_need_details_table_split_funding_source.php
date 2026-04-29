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
        Schema::table('need_details', function (Blueprint $table) {
            $table->foreignId('funding_source_id')->nullable()->constrained('funding_sources')->nullOnDelete();
            $table->string('estimated_cost')->nullable();
        });

        // Data migration: populate estimated_cost from needs.total_price
        $details = DB::table('need_details')
            ->join('needs', 'need_details.need_id', '=', 'needs.id')
            ->select('need_details.id', 'needs.total_price')
            ->get();

        foreach ($details as $detail) {
            $formatted = $this->formatIndonesianCurrencyWithTerbilang((float) $detail->total_price);
            DB::table('need_details')
                ->where('id', $detail->id)
                ->update(['estimated_cost' => $formatted]);
        }

        Schema::table('need_details', function (Blueprint $table) {
            $table->dropColumn('funding_source_and_estimated_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('need_details', function (Blueprint $table) {
            $table->text('funding_source_and_estimated_cost')->nullable();
        });

        Schema::table('need_details', function (Blueprint $table) {
            $table->dropConstrainedForeignId('funding_source_id');
            $table->dropColumn('estimated_cost');
        });
    }

    /**
     * Format number to Indonesian Rupiah with spelled-out text (Terbilang).
     */
    private function formatIndonesianCurrencyWithTerbilang(float $number): string
    {
        $formattedNumber = 'Rp '.number_format($number, 0, ',', '.');
        $terbilang = $this->terbilang($number).' Rupiah';
        $terbilang = ucfirst(trim($terbilang));

        return "{$formattedNumber} ({$terbilang})";
    }

    /**
     * Convert number to Indonesian words.
     */
    private function terbilang(float $number): string
    {
        $number = abs($number);
        $words = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
        $temp = '';

        if ($number < 12) {
            $temp = ' '.$words[(int) $number];
        } elseif ($number < 20) {
            $temp = $this->terbilang($number - 10).' belas';
        } elseif ($number < 100) {
            $temp = $this->terbilang($number / 10).' puluh'.$this->terbilang($number % 10);
        } elseif ($number < 200) {
            $temp = ' seratus'.$this->terbilang($number - 100);
        } elseif ($number < 1000) {
            $temp = $this->terbilang($number / 100).' ratus'.$this->terbilang($number % 100);
        } elseif ($number < 2000) {
            $temp = ' seribu'.$this->terbilang($number - 1000);
        } elseif ($number < 1000000) {
            $temp = $this->terbilang($number / 1000).' ribu'.$this->terbilang($number % 1000);
        } elseif ($number < 1000000000) {
            $temp = $this->terbilang($number / 1000000).' juta'.$this->terbilang($number % 1000000);
        } elseif ($number < 1000000000000) {
            $temp = $this->terbilang($number / 1000000000).' miliar'.$this->terbilang($number % 1000000000);
        }

        return $temp;
    }
};
