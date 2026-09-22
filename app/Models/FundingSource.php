<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\FundingSourceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name'])]
class FundingSource extends Model
{
    /** @use HasFactory<FundingSourceFactory> */
    use HasFactory;
}
