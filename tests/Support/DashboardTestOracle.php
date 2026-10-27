<?php

declare(strict_types=1);

namespace Tests\Support;

use Illuminate\Support\Facades\DB;

/**
 * Independent verification oracle for dashboard metrics.
 * Computes raw numbers directly from PostgreSQL/database tables
 * WITHOUT using application Eloquent models, calculators, scopes, or helpers.
 */
final class DashboardTestOracle
{
    /**
     * Compute raw KPI overview metrics.
     *
     * @param  array<int>|null  $allowedUnitIds
     * @return array<string, mixed>
     */
    public static function computeKpiStats(int $groupId, ?array $allowedUnitIds = null): array
    {
        $unitFilter = '';
        $bindings = [$groupId];

        if ($allowedUnitIds !== null) {
            if (empty($allowedUnitIds)) {
                $unitFilter = 'AND 1=0';
            } else {
                $placeholders = implode(',', array_fill(0, count($allowedUnitIds), '?'));
                $unitFilter = "AND organizational_unit_id IN ({$placeholders})";
                $bindings = array_merge($bindings, $allowedUnitIds);
            }
        }

        $sql = "
            SELECT
                COUNT(*) as total_needs,
                COUNT(CASE WHEN status != 'rejected' THEN 1 END) as active_needs_count,
                COALESCE(SUM(CASE WHEN status != 'rejected' THEN total_price ELSE 0 END), 0) as total_budget,
                COUNT(CASE WHEN status != 'rejected' AND is_priority = true THEN 1 END) as priority_needs,
                COALESCE(SUM(CASE WHEN status != 'rejected' AND is_priority = true THEN total_price ELSE 0 END), 0) as priority_budget,
                COUNT(CASE WHEN status != 'rejected' AND is_priority = true AND approved_by_director_at IS NULL THEN 1 END) as unapproved_priority_count,
                COALESCE(SUM(CASE WHEN status != 'rejected' AND is_priority = true AND approved_by_director_at IS NULL THEN total_price ELSE 0 END), 0) as unapproved_priority_budget,
                COUNT(CASE WHEN status != 'rejected' AND checklist_percentage > 0 THEN 1 END) as assessed_needs_count,
                COALESCE(AVG(CASE WHEN status != 'rejected' AND checklist_percentage > 0 THEN checklist_percentage END), 0) as avg_completeness,
                COUNT(CASE WHEN approved_by_director_at IS NOT NULL THEN 1 END) as approved_by_director,
                COALESCE(SUM(CASE WHEN approved_by_director_at IS NOT NULL THEN total_price ELSE 0 END), 0) as approved_budget,
                COUNT(CASE WHEN status = 'approved' AND approved_by_director_at IS NULL THEN 1 END) as awaiting_director,
                COALESCE(SUM(CASE WHEN status = 'approved' AND approved_by_director_at IS NULL THEN total_price ELSE 0 END), 0) as awaiting_director_budget,
                COUNT(CASE WHEN status = 'draft' AND approved_by_director_at IS NULL THEN 1 END) as draft_count,
                COALESCE(SUM(CASE WHEN status = 'draft' AND approved_by_director_at IS NULL THEN total_price ELSE 0 END), 0) as draft_budget,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
                COALESCE(SUM(CASE WHEN status = 'rejected' THEN total_price ELSE 0 END), 0) as rejected_budget,
                COUNT(CASE WHEN is_locked = true THEN 1 END) as locked_count
            FROM needs
            WHERE need_group_id = ?
              AND deleted_at IS NULL
              {$unitFilter}
        ";

        $rows = DB::select($sql, $bindings);
        $res = (array) ($rows[0] ?? []);

        return [
            'total_needs' => (int) ($res['total_needs'] ?? 0),
            'active_needs_count' => (int) ($res['active_needs_count'] ?? 0),
            'total_budget' => (float) ($res['total_budget'] ?? 0),
            'priority_needs' => (int) ($res['priority_needs'] ?? 0),
            'priority_budget' => (float) ($res['priority_budget'] ?? 0),
            'unapproved_priority_count' => (int) ($res['unapproved_priority_count'] ?? 0),
            'unapproved_priority_budget' => (float) ($res['unapproved_priority_budget'] ?? 0),
            'assessed_needs_count' => (int) ($res['assessed_needs_count'] ?? 0),
            'avg_completeness' => (float) ($res['avg_completeness'] ?? 0),
            'approved_by_director' => (int) ($res['approved_by_director'] ?? 0),
            'approved_budget' => (float) ($res['approved_budget'] ?? 0),
            'awaiting_director' => (int) ($res['awaiting_director'] ?? 0),
            'awaiting_director_budget' => (float) ($res['awaiting_director_budget'] ?? 0),
            'draft_count' => (int) ($res['draft_count'] ?? 0),
            'draft_budget' => (float) ($res['draft_budget'] ?? 0),
            'rejected_count' => (int) ($res['rejected_count'] ?? 0),
            'rejected_budget' => (float) ($res['rejected_budget'] ?? 0),
            'locked_count' => (int) ($res['locked_count'] ?? 0),
        ];
    }

    /**
     * Compute raw priority matrix 3x3 (urgency x impact).
     *
     * @param  array<int>|null  $allowedUnitIds
     * @return array<string, array{urgency: string, impact: string, count: int, budget: float}>
     */
    public static function computePriorityMatrix(int $groupId, ?array $allowedUnitIds = null): array
    {
        $unitFilter = '';
        $bindings = [$groupId];

        if ($allowedUnitIds !== null) {
            if (empty($allowedUnitIds)) {
                $unitFilter = 'AND 1=0';
            } else {
                $placeholders = implode(',', array_fill(0, count($allowedUnitIds), '?'));
                $unitFilter = "AND organizational_unit_id IN ({$placeholders})";
                $bindings = array_merge($bindings, $allowedUnitIds);
            }
        }

        $sql = "
            SELECT
                LOWER(urgency) as urgency,
                LOWER(impact) as impact,
                COUNT(*) as count,
                COALESCE(SUM(total_price), 0) as budget
            FROM needs
            WHERE need_group_id = ?
              AND deleted_at IS NULL
              AND status != 'rejected'
              {$unitFilter}
            GROUP BY LOWER(urgency), LOWER(impact)
        ";

        $rows = DB::select($sql, $bindings);

        $matrix = [];
        foreach (['high', 'medium', 'low'] as $u) {
            foreach (['high', 'medium', 'low'] as $imp) {
                $matrix["{$u}_{$imp}"] = [
                    'urgency' => $u,
                    'impact' => $imp,
                    'count' => 0,
                    'budget' => 0.0,
                ];
            }
        }

        foreach ($rows as $r) {
            $key = "{$r->urgency}_{$r->impact}";
            if (isset($matrix[$key])) {
                $matrix[$key]['count'] = (int) $r->count;
                $matrix[$key]['budget'] = (float) $r->budget;
            }
        }

        return $matrix;
    }

    /**
     * Compute raw Needs by Unit aggregation.
     *
     * @param  array<int>|null  $allowedUnitIds
     * @return array<int, array<string, mixed>>
     */
    public static function computeNeedsByUnit(int $groupId, ?array $allowedUnitIds = null): array
    {
        $unitFilter = '';
        $bindings = [$groupId];

        if ($allowedUnitIds !== null) {
            if (empty($allowedUnitIds)) {
                $unitFilter = 'AND 1=0';
            } else {
                $placeholders = implode(',', array_fill(0, count($allowedUnitIds), '?'));
                $unitFilter = "AND n.organizational_unit_id IN ({$placeholders})";
                $bindings = array_merge($bindings, $allowedUnitIds);
            }
        }

        $sql = "
            SELECT
                n.organizational_unit_id as unit_id,
                COALESCE(u.name, 'Unknown') as unit_name,
                COUNT(*) as count,
                COALESCE(SUM(n.total_price), 0) as total_budget,
                COUNT(CASE WHEN n.is_priority = true THEN 1 END) as priority_count,
                COUNT(CASE WHEN n.approved_by_director_at IS NOT NULL THEN 1 END) as approved_count,
                COALESCE(SUM(CASE WHEN n.approved_by_director_at IS NOT NULL THEN n.total_price ELSE 0 END), 0) as approved_budget,
                COUNT(CASE WHEN n.status = 'approved' AND n.approved_by_director_at IS NULL THEN 1 END) as under_review_count,
                COALESCE(SUM(CASE WHEN n.status = 'approved' AND n.approved_by_director_at IS NULL THEN n.total_price ELSE 0 END), 0) as review_budget,
                COUNT(CASE WHEN n.status = 'draft' AND n.approved_by_director_at IS NULL THEN 1 END) as draft_count,
                COALESCE(SUM(CASE WHEN n.status = 'draft' AND n.approved_by_director_at IS NULL THEN n.total_price ELSE 0 END), 0) as draft_budget,
                COUNT(CASE WHEN n.status = 'rejected' THEN 1 END) as rejected_count
            FROM needs n
            LEFT JOIN organizational_units u ON n.organizational_unit_id = u.id AND u.deleted_at IS NULL
            WHERE n.need_group_id = ?
              AND n.deleted_at IS NULL
              AND n.status != 'rejected'
              {$unitFilter}
            GROUP BY n.organizational_unit_id, u.name
            ORDER BY total_budget DESC, count DESC
        ";

        $rows = DB::select($sql, $bindings);

        return array_map(fn ($r) => [
            'unit_id' => (int) $r->unit_id,
            'name' => (string) $r->unit_name,
            'count' => (int) $r->count,
            'total_budget' => (float) $r->total_budget,
            'priority_count' => (int) $r->priority_count,
            'approved_count' => (int) $r->approved_count,
            'approved_budget' => (float) $r->approved_budget,
            'under_review_count' => (int) $r->under_review_count,
            'review_budget' => (float) $r->review_budget,
            'draft_count' => (int) $r->draft_count,
            'draft_budget' => (float) $r->draft_budget,
            'rejected_count' => (int) $r->rejected_count,
        ], $rows);
    }

    /**
     * Compute raw Needs by Type aggregation.
     *
     * @param  array<int>|null  $allowedUnitIds
     * @return array<int, array<string, mixed>>
     */
    public static function computeNeedsByType(int $groupId, ?array $allowedUnitIds = null): array
    {
        $unitFilter = '';
        $bindings = [$groupId];

        if ($allowedUnitIds !== null) {
            if (empty($allowedUnitIds)) {
                $unitFilter = 'AND 1=0';
            } else {
                $placeholders = implode(',', array_fill(0, count($allowedUnitIds), '?'));
                $unitFilter = "AND n.organizational_unit_id IN ({$placeholders})";
                $bindings = array_merge($bindings, $allowedUnitIds);
            }
        }

        $sql = "
            SELECT
                n.need_type_id as type_id,
                COALESCE(t.name, 'Lainnya') as type_name,
                COUNT(*) as count,
                COALESCE(SUM(n.total_price), 0) as total_budget
            FROM needs n
            LEFT JOIN need_types t ON n.need_type_id = t.id AND t.deleted_at IS NULL
            WHERE n.need_group_id = ?
              AND n.deleted_at IS NULL
              AND n.status != 'rejected'
              {$unitFilter}
            GROUP BY n.need_type_id, t.name
            ORDER BY total_budget DESC
        ";

        $rows = DB::select($sql, $bindings);

        return array_map(fn ($r) => [
            'type_id' => (int) $r->type_id,
            'name' => (string) $r->type_name,
            'count' => (int) $r->count,
            'total_budget' => (float) $r->total_budget,
        ], $rows);
    }

    /**
     * Compute raw funding source aggregation with proper soft-delete filter.
     *
     * @param  array<int>|null  $allowedUnitIds
     * @return array<int, array{name: string, needs_count: int, total_budget: float}>
     */
    public static function computeFundingSources(int $groupId, ?array $allowedUnitIds = null): array
    {
        $unitFilter = '';
        $bindings = [$groupId];

        if ($allowedUnitIds !== null) {
            if (empty($allowedUnitIds)) {
                $unitFilter = 'AND 1=0';
            } else {
                $placeholders = implode(',', array_fill(0, count($allowedUnitIds), '?'));
                $unitFilter = "AND n.organizational_unit_id IN ({$placeholders})";
                $bindings = array_merge($bindings, $allowedUnitIds);
            }
        }

        $sql = "
            SELECT
                fs.name,
                COUNT(DISTINCT n.id) as needs_count,
                COALESCE(SUM(n.total_price), 0) as total_budget
            FROM funding_sources fs
            JOIN need_detail_funding_source ndfs ON fs.id = ndfs.funding_source_id
            JOIN need_details nd ON ndfs.need_detail_id = nd.id
            JOIN needs n ON nd.need_id = n.id
            WHERE n.need_group_id = ?
              AND n.deleted_at IS NULL
              AND n.status != 'rejected'
              {$unitFilter}
            GROUP BY fs.id, fs.name
            ORDER BY total_budget DESC
        ";

        $rows = DB::select($sql, $bindings);

        return array_map(fn ($r) => [
            'name' => (string) $r->name,
            'needs_count' => (int) $r->needs_count,
            'total_budget' => (float) $r->total_budget,
        ], $rows);
    }

    /**
     * Compute raw data readiness coverage metrics.
     *
     * @param  array<int>|null  $allowedUnitIds
     * @return array{attachment_coverage: float, alignment_coverage: float, kak_detail_coverage: float}
     */
    public static function computeDataReadiness(int $groupId, ?array $allowedUnitIds = null): array
    {
        $unitFilter = '';
        $bindings = [$groupId];

        if ($allowedUnitIds !== null) {
            if (empty($allowedUnitIds)) {
                $unitFilter = 'AND 1=0';
            } else {
                $placeholders = implode(',', array_fill(0, count($allowedUnitIds), '?'));
                $unitFilter = "AND n.organizational_unit_id IN ({$placeholders})";
                $bindings = array_merge($bindings, $allowedUnitIds);
            }
        }

        $sql = "
            SELECT
                COUNT(DISTINCT n.id) as total_needs,
                COUNT(DISTINCT CASE WHEN na.id IS NOT NULL THEN n.id END) as with_attachments,
                COUNT(DISTINCT CASE WHEN nd.id IS NOT NULL THEN n.id END) as with_detail,
                COUNT(DISTINCT CASE WHEN (ns.id IS NOT NULL OR ni.id IS NOT NULL OR kin.id IS NOT NULL OR nssp.id IS NOT NULL) THEN n.id END) as with_alignment
            FROM needs n
            LEFT JOIN need_attachments na ON n.id = na.need_id
            LEFT JOIN need_details nd ON n.id = nd.need_id
            LEFT JOIN need_sasaran ns ON n.id = ns.need_id
            LEFT JOIN need_indicator ni ON n.id = ni.need_id
            LEFT JOIN kpi_indicator_need kin ON n.id = kin.need_id
            LEFT JOIN need_strategic_service_plan nssp ON n.id = nssp.need_id
            WHERE n.need_group_id = ?
              AND n.deleted_at IS NULL
              {$unitFilter}
        ";

        $rows = DB::select($sql, $bindings);
        $res = (array) ($rows[0] ?? []);
        $total = (int) ($res['total_needs'] ?? 0);

        return [
            'attachment_coverage' => $total > 0 ? round(((int) $res['with_attachments'] / $total) * 100, 1) : 0.0,
            'kak_detail_coverage' => $total > 0 ? round(((int) $res['with_detail'] / $total) * 100, 1) : 0.0,
            'alignment_coverage' => $total > 0 ? round(((int) $res['with_alignment'] / $total) * 100, 1) : 0.0,
        ];
    }
}
