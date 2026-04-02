<?php

namespace App\Models;

use Database\Factories\KpiAnnualTargetFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiAnnualTarget extends Model
{
    /** @use HasFactory<KpiAnnualTargetFactory> */
    use HasFactory;

    protected $fillable = [
        'indicator_id',
        'year',
        'target_value',
    ];

    protected $casts = [
        'year' => 'integer',
    ];

    public function indicator()
    {
        return $this->belongsTo(KpiIndicator::class, 'indicator_id');
    }
}
