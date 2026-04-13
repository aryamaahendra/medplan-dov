<?php

namespace App\Jobs;

use App\Actions\Planning\CalculateActivityBudgetAction;
use App\Models\PlanningActivityVersion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CalculateActivityBudgetJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public PlanningActivityVersion $activity,
        public int $year
    ) {}

    public function handle(): void
    {
        app(CalculateActivityBudgetAction::class)->execute(
            $this->activity,
            $this->year
        );
    }
}
