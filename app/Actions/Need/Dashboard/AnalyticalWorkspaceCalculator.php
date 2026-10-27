<?php

declare(strict_types=1);

namespace App\Actions\Need\Dashboard;

use App\Models\NeedGroup;
use App\Models\User;

class AnalyticalWorkspaceCalculator
{
    public function __construct(
        protected DashboardScopeResolver $scopeResolver
    ) {}

    /**
     * Compute Analytical Workspace specifics (Variant C).
     *
     * @return array<string, mixed>
     */
    public function calculate(int $groupId, ?User $user, ?NeedGroup $currentGroup, ?int $compareGroupId = null): array
    {
        return [
            'compare_group_id' => $compareGroupId,
        ];
    }
}
