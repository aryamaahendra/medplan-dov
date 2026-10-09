<?php

declare(strict_types=1);

namespace App\Actions\Need;

use App\Actions\Need\Dashboard\AnalyticalWorkspaceCalculator;
use App\Actions\Need\Dashboard\DashboardScopeResolver;
use App\Actions\Need\Dashboard\ExecutiveDashboardCalculator;
use App\Actions\Need\Dashboard\OperationsDashboardCalculator;
use App\Exceptions\Need\NeedExceptionCatalog;
use App\Models\Need;
use App\Models\NeedGroup;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

/**
 * High-level coordinator and facade for multi-variant Needs dashboard analytics.
 * Delegates specialized metrics calculation to focused domain calculators.
 */
class GetNeedDashboardStatsAction
{
    /**
     * Cache TTL in seconds (60s as per planning spec).
     */
    public const int CACHE_TTL = 60;

    public function __construct(
        protected DashboardScopeResolver $scopeResolver,
        protected ExecutiveDashboardCalculator $executiveCalculator,
        protected OperationsDashboardCalculator $operationsCalculator,
        protected AnalyticalWorkspaceCalculator $analyticalCalculator,
        protected NeedExceptionCatalog $exceptionCatalog
    ) {}

    /**
     * Compute full dashboard payload for a given group and user scope.
     *
     * @return array<string, mixed>
     */
    public function handle(int|string|null $groupId, ?User $user = null, ?int $compareGroupId = null): array
    {
        return $this->getDashboardPayload($groupId, $user, $compareGroupId);
    }

    public function getDashboardPayload(int|string|null $groupId, ?User $user = null, ?int $compareGroupId = null): array
    {
        if (! $groupId) {
            return [];
        }

        $userId = $user ? $user->id : 0;
        $roleScopeKey = $this->scopeResolver->resolveScopeKey($user);
        $cacheKey = "needs_dashboard_{$groupId}_{$userId}_{$roleScopeKey}_comp_{$compareGroupId}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($groupId, $user, $compareGroupId) {
            return $this->computeDashboardPayload((int) $groupId, $user, $compareGroupId);
        });
    }

    /**
     * Clear dashboard cache for a need group.
     */
    public static function clearCacheForGroup(?int $groupId = null): void
    {
        Cache::increment('needs_dashboard_cache_version');
    }

    /**
     * Apply user scope to query.
     */
    public function applyScope(Builder $query, ?User $user): Builder
    {
        return $this->scopeResolver->applyScope($query, $user);
    }

    /**
     * Legacy method for backwards compatibility with existing callers.
     */
    public function stats(int|string|null $groupId, ?NeedGroup $currentGroup = null, ?User $user = null): array
    {
        $payload = $this->getDashboardPayload($groupId, $user);

        return $payload['stats'] ?? [];
    }

    /**
     * Legacy method for backwards compatibility.
     */
    public function statusDistribution(int|string|null $groupId, ?User $user = null): array
    {
        $payload = $this->getDashboardPayload($groupId, $user);

        return $payload['statusDistribution'] ?? [];
    }

    /**
     * Legacy method for backwards compatibility.
     */
    public function byUnit(int|string|null $groupId, ?User $user = null): array
    {
        $payload = $this->getDashboardPayload($groupId, $user);

        return $payload['needsByUnit'] ?? [];
    }

    /**
     * Legacy method for backwards compatibility.
     */
    public function byType(int|string|null $groupId, ?User $user = null): array
    {
        $payload = $this->getDashboardPayload($groupId, $user);

        return $payload['needsByType'] ?? [];
    }

    /**
     * Compute actual payload across executive, operations, and analytical domains.
     *
     * @return array<string, mixed>
     */
    private function computeDashboardPayload(int $groupId, ?User $user, ?int $compareGroupId = null): array
    {
        $currentGroup = NeedGroup::query()->find($groupId);

        // Resolve previous / compare group
        $prevGroup = null;
        if ($compareGroupId) {
            $prevGroup = NeedGroup::query()->find($compareGroupId);
        } elseif ($currentGroup) {
            $prevGroup = NeedGroup::query()
                ->where('id', '!=', $groupId)
                ->where('year', '<=', $currentGroup->year)
                ->orderByDesc('year')
                ->orderByDesc('id')
                ->first();
        }

        // 1. Executive & Foundational Aggregates
        $exec = $this->executiveCalculator->calculate($groupId, $user, $currentGroup, $prevGroup);

        // 2. Operations Command Center (Variant B)
        $operations = $this->operationsCalculator->calculate(
            $currentGroup,
            $exec['baseQuery'],
            $user,
            $exec['stats'],
            $exec['allUnitProgress'],
            $exec['now']
        );

        return [
            'currentGroup' => $currentGroup ? [
                'id' => $currentGroup->id,
                'name' => $currentGroup->name,
                'year' => $currentGroup->year,
                'is_active' => (bool) $currentGroup->is_active,
                'window_status' => $currentGroup->getSubmissionWindowStatus(),
                'submission_end_at' => $currentGroup->submission_end_at,
            ] : null,
            'availableGroups' => $exec['availableGroups'],
            'stats' => $exec['stats'],
            'stageDistribution' => $exec['stageDistribution'],
            'statusDistribution' => $exec['statusDistribution'],
            'matrix' => $exec['matrix'],
            'decisionQueue' => $exec['decisionQueue'],
            'needsByUnit' => $exec['needsByUnit'],
            'needsByType' => $exec['needsByType'],
            'allUnitProgress' => $exec['allUnitProgress'],
            'dataReadiness' => $exec['dataReadiness'],
            'exceptions' => $exec['exceptions'],
            'activeUnlocks' => $exec['activeUnlocks'],
            'sasaranOverview' => $exec['sasaranOverview'],
            'fundingSources' => $exec['fundingSources'],
            'checklistBuckets' => $exec['checklistBuckets'],
            'myUnitData' => $exec['myUnitData'],
            'operations' => $operations,
        ];
    }
}
