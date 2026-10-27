<?php

declare(strict_types=1);

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

    public int $tries = 3;

    public int $timeout = 120;

    public array $backoff = [60, 120, 300];

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

    public function failed(\Throwable $e): void
    {
        logger()->error('CalculateActivityBudgetJob failed', [
            'activity' => $this->activity->id,
            'year' => $this->year,
            'error' => $e->getMessage(),
        ]);
    }
}
