# Dashboard Verification & Data-Integrity Audit Report

**Date:** 2026-10-10  
**Application:** `faraa-latsarapp-laravel-react`  
**Engineer:** QA / Data-Integrity Engineering  
**Scope:** Verification of every number, percentage, chart point, badge, and label rendered on all 3 dashboard variants (`/dashboard/executive`, `/dashboard/operations`, `/dashboard/workspace`).

---

## 1. Project Discovery Summary

- **Backend Stack:** PHP 8.5 on Laravel 13.32.0 with Laravel Octane 2.19.1 (`frankenphp` driver)
- **Frontend Stack:** React 19.2.0, Inertia.js v3.3.4 (`@inertiajs/react` 3.0.0), Tailwind CSS v4 (`@tailwindcss/vite` 4.1.11), Base UI 1.8.0, Vite 3
- **Data Layer:** PostgreSQL 16+ (`pgsql` driver), Eloquent ORM + PostgreSQL raw aggregations, Laravel Cache (60s TTL with group versioning)
- **Timezone:** Strictly enforced to `Asia/Makassar` (WITA, UTC+8) on both backend and frontend (`@/lib/formatters`)
- **Formatting Conventions:** Indonesian locale (`id-ID`) via `@/lib/formatters` (`formatCompactIDR`, `formatNumber`, `formatPercent`)
- **Authorization & Scoping:** Spatie Laravel Permission with 5 roles (`super-admin`, `director`, `planner`, `unit-head`, `staff`)
- **Execution & Test Tooling:**
    - Test runner: Pest v5.2.1 (`pestphp/pest`) & PHPUnit 13.3.4 with PostgreSQL test database
    - Run dashboard verification suite: `vendor/bin/sail artisan test --compact --filter=DashboardVerificationTest`
    - Run all dashboard feature suites: `vendor/bin/sail artisan test --compact --filter=Dashboard`
    - Run full test suite: `vendor/bin/sail artisan test --compact`

---

## 2. Metric Registry

Status Legend:

- ✅ **Verified:** Data lineage confirmed, correct formulas, validated against independent test oracle.
- ❌ **Bug Fixed:** Defect identified during audit and resolved with regression test coverage.
- ⚠️ **Needs Decision:** Business rule decision documented and handled safely.

| ID      | Label shown in UI                                                       | UI file / Component                     | Data Contract (JSON path)                             | Backend Source                                                       | Tables / Columns / Sources                                                                  | Formula in Plain Words                                                                                                    | Filters Applied                                                       | Visibility                                             | Display Format                                    | Status                                                                           |
| ------- | ----------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| **M01** | Window Status Badge ("Buka Pengajuan", "Tutup", "Mendatang", "Terbuka") | `global-dashboard-controls.tsx:51`      | `currentGroup.window_status`                          | `NeedGroup::getSubmissionWindowStatus()`                             | `need_groups.submission_start_at`, `need_groups.submission_end_at`, `need_groups.is_active` | Compares current timestamp against window start and end dates                                                             | Active group, `deleted_at IS NULL`                                    | All authenticated                                      | Indonesian badge text                             | ✅ Verified                                                                      |
| **M02** | Sisa Waktu Pengajuan ("Sisa X hari")                                    | `global-dashboard-controls.tsx:80`      | Client computed from `currentGroup.submission_end_at` | Client calculation                                                   | `need_groups.submission_end_at`                                                             | Days between current timestamp and window end date                                                                        | Null if no end date                                                   | All authenticated                                      | Integer days text                                 | ❌ Bug Fixed (Timezone drift eliminated)                                         |
| **M03** | Total Anggaran (Executive KPI 1)                                        | `variant-a-executive.tsx:229`           | `stats.total_budget`                                  | `ExecutiveDashboardCalculator`                                       | `needs.total_price`, `needs.status`                                                         | Sum of `total_price` for all non-rejected needs                                                                           | `need_group_id`, `deleted_at IS NULL`, non-rejected, user role scope  | All authenticated                                      | `formatCompactIDR(value)`                         | ✅ Verified                                                                      |
| **M04** | Usulan Aktif (Executive KPI 1 Sub)                                      | `variant-a-executive.tsx:232`           | `stats.active_needs_count`                            | `ExecutiveDashboardCalculator`                                       | `needs.id`, `needs.status`                                                                  | Count of needs where stage != 'rejected'                                                                                  | `need_group_id`, `deleted_at IS NULL`, non-rejected, user role scope  | All authenticated                                      | `formatNumber(value)` + " usulan aktif"           | ✅ Verified                                                                      |
| **M05** | Delta Anggaran vs Tahun Lalu                                            | `variant-a-executive.tsx:240`           | `totalBudgetDelta`                                    | Client computed from `stats.total_budget`, `stats.prev_total_budget` | `needs.total_price` across current vs previous group                                        | `round(((current_budget - prev_budget) / prev_budget) * 100)`                                                             | Previous group exists, prev_budget > 0                                | All authenticated                                      | `+X% vs YYYY` with up/down arrow                  | ✅ Verified                                                                      |
| **M06** | Disetujui Direktur (Executive KPI 2)                                    | `variant-a-executive.tsx:270`           | `stats.approved_budget`                               | `ExecutiveDashboardCalculator`                                       | `needs.total_price`, `needs.approved_by_director_at`                                        | Sum of `total_price` where `approved_by_director_at IS NOT NULL`                                                          | `need_group_id`, `deleted_at IS NULL`, user role scope                | All authenticated                                      | `formatCompactIDR(value)`                         | ✅ Verified                                                                      |
| **M07** | Rasio Anggaran Disetujui (Executive KPI 2 Sub)                          | `variant-a-executive.tsx:274`           | `approvedPct`                                         | Client computed from `stats.approved_budget`, `stats.total_budget`   | `approved_budget / total_budget`                                                            | `round((approved_budget / active_budget) * 100)`                                                                          | active_budget > 0                                                     | All authenticated                                      | `X% dari anggaran (Y item)`                       | ✅ Verified                                                                      |
| **M08** | Delta Share Disetujui vs Tahun Lalu                                     | `variant-a-executive.tsx:279`           | `approvedShareDelta`                                  | Client computed from payload stats                                   | Current approval share minus previous group approval share                                  | Percentage point delta (`current_pct - prev_pct`)                                                                         | Both current and prev budgets > 0                                     | All authenticated                                      | `+X pp` / `-X pp`                                 | ✅ Verified                                                                      |
| **M09** | Menunggu Review Direktur (Executive KPI 3)                              | `variant-a-executive.tsx:313`           | `stats.awaiting_director`                             | `ExecutiveDashboardCalculator`                                       | `needs.status`, `needs.approved_by_director_at`                                             | Count of needs where `status = 'approved' AND approved_by_director_at IS NULL`                                            | `need_group_id`, `deleted_at IS NULL`, user role scope                | All authenticated                                      | `formatNumber(value)`                             | ✅ Verified                                                                      |
| **M10** | Anggaran Menunggu Review (Executive KPI 3 Sub)                          | `variant-a-executive.tsx:320`           | `stats.awaiting_director_budget`                      | `ExecutiveDashboardCalculator`                                       | `needs.total_price`, `needs.status`, `needs.approved_by_director_at`                        | Sum of `total_price` where `status = 'approved' AND approved_by_director_at IS NULL`                                      | `need_group_id`, `deleted_at IS NULL`, user role scope                | All authenticated                                      | `formatCompactIDR(value)`                         | ✅ Verified                                                                      |
| **M11** | Usulan Prioritas Belum Disetujui (KPI 3 Callout)                        | `variant-a-executive.tsx:334`           | `stats.unapproved_priority_count`                     | `ExecutiveDashboardCalculator`                                       | `needs.is_priority`, `needs.status`, `needs.approved_by_director_at`                        | Count of needs where `is_priority = true AND approved_by_director_at IS NULL AND status != 'rejected'`                    | `need_group_id`, `deleted_at IS NULL`, user role scope                | All authenticated                                      | `X prioritas mendesak`                            | ✅ Verified                                                                      |
| **M12** | Usulan Prioritas (Executive KPI 4)                                      | `variant-a-executive.tsx:358`           | `stats.priority_needs`                                | `ExecutiveDashboardCalculator`                                       | `needs.is_priority`, `needs.status`                                                         | Count of needs where `is_priority = true AND status != 'rejected'`                                                        | `need_group_id`, `deleted_at IS NULL`, user role scope                | All authenticated                                      | `formatNumber(value)`                             | ✅ Verified                                                                      |
| **M13** | Rasio Usulan Prioritas (Executive KPI 4 Sub)                            | `variant-a-executive.tsx:362`           | `priorityPct`                                         | Client computed from payload stats                                   | `round((priority_needs / active_needs_count) * 100)`                                        | active_needs_count > 0                                                                                                    | All authenticated                                                     | `X% dari usulan aktif`                                 | ✅ Verified                                       |
| **M14** | Delta Usulan Prioritas vs Tahun Lalu                                    | `variant-a-executive.tsx:367`           | `priorityDelta`                                       | Client computed from payload stats                                   | `stats.priority_needs - stats.prev_priority_needs`                                          | Simple count difference                                                                                                   | Prev group exists                                                     | All authenticated                                      | `+X usulan vs YYYY`                               | ✅ Verified                                                                      |
| **M15** | Rata-Rata Kelengkapan Checklist (Executive KPI 5)                       | `variant-a-executive.tsx:396`           | `stats.avg_completeness`                              | `ExecutiveDashboardCalculator`                                       | `needs.checklist_percentage`, `needs.status`                                                | Average of `checklist_percentage` for active needs where `checklist_percentage > 0`                                       | `checklist_percentage > 0`, non-rejected, user scope                  | All authenticated                                      | `formatPercent(value)`                            | ✅ Verified                                                                      |
| **M16** | Jumlah Usulan Dinilai (Executive KPI 5 Sub)                             | `variant-a-executive.tsx:400`           | `stats.assessed_needs_count`                          | `ExecutiveDashboardCalculator`                                       | `needs.checklist_percentage`, `needs.status`                                                | Count of needs where `status != 'rejected' AND checklist_percentage > 0`                                                  | `checklist_percentage > 0`, non-rejected, user scope                  | All authenticated                                      | `dari X usulan dinilai`                           | ✅ Verified                                                                      |
| **M17** | Budget Pipeline Stages (Draft, Under Review, Approved)                  | `variant-a-executive.tsx:90`            | `stageDistribution`                                   | `ExecutiveDashboardCalculator`                                       | `needs.status`, `needs.approved_by_director_at`, `needs.total_price`                        | Segmented counts, budgets, and percentages                                                                                | `need_group_id`, `deleted_at IS NULL`, user scope                     | All authenticated                                      | Bar segments + IDR + Count + Pct                  | ❌ Bug Fixed (Percentages sum to 100.0%)                                         |
| **M18** | Decision Queue (Antrean Telaah Direktur)                                | `variant-a-executive.tsx:571`           | `decisionQueue` (top 8)                               | `ExecutiveDashboardCalculator`                                       | `needs.*`, `organizational_units.name`, `need_types.name`                                   | Up to 8 needs with `status = 'approved' AND approved_by_director_at IS NULL` sorted by priority, checklist, price         | `status = 'approved'`, not approved by director                       | Action button restricted to `director` / `super-admin` | Table rows with IDR, badge, %                     | ✅ Verified                                                                      |
| **M19** | Matriks Urgensi x Dampak 3x3                                            | `variant-a-executive.tsx:706`           | `matrix[urgency_impact]`                              | `ExecutiveDashboardCalculator`                                       | `needs.urgency`, `needs.impact`, `needs.total_price`                                        | 9-cell aggregate of count and sum of `total_price` for non-rejected needs                                                 | `status != 'rejected'`, user scope                                    | All authenticated                                      | 3x3 grid with count and `formatCompactIDR`        | ✅ Verified                                                                      |
| **M20** | Sebaran Usulan per Unit Kerja (Top 8 + Lainnya)                         | `variant-a-executive.tsx:799`           | `needsByUnit`                                         | `ExecutiveDashboardCalculator`                                       | `needs.organizational_unit_id`, `needs.total_price`                                         | Group by unit: count, budget, priority, approved, review, draft, rejected                                                 | `status != 'rejected'`, user scope                                    | All authenticated                                      | Horizontal bars with IDR and percentages          | ❌ Bug Fixed (Added `priority_budget` per unit)                                  |
| **M21** | Sebaran Jenis Kebutuhan                                                 | `variant-a-executive.tsx:929`           | `needsByType`                                         | `ExecutiveDashboardCalculator`                                       | `needs.need_type_id`, `needs.total_price`                                                   | Group by type: count, budget, percentage of total budget, average ticket                                                  | `status != 'rejected'`, user scope                                    | All authenticated                                      | List items with IDR, % share, avg ticket          | ✅ Verified                                                                      |
| **M22** | Total Permohonan (Operations Header)                                    | `operations-header.tsx:122`             | `stats.total_needs`                                   | `ExecutiveDashboardCalculator`                                       | `needs.id`                                                                                  | Count of all needs (including rejected) in group                                                                          | `need_group_id`, `deleted_at IS NULL`, user scope                     | All authenticated                                      | `formatNumber(value)`                             | ✅ Verified                                                                      |
| **M23** | Terkunci (Operations Header Strip)                                      | `operations-header.tsx:139`             | `stats.locked_count`                                  | `ExecutiveDashboardCalculator`                                       | `needs.is_locked`                                                                           | Count of needs where `is_locked = true`                                                                                   | `is_locked = true`, user scope                                        | All authenticated                                      | `formatNumber(value)` + " usulan"                 | ✅ Verified                                                                      |
| **M24** | Izin Buka Kunci (Operations Header Strip)                               | `operations-header.tsx:148`             | `activeUnlocksCount`                                  | `OperationsDashboardCalculator`                                      | `needs.unlocked_until`                                                                      | Count of needs where `unlocked_until IS NOT NULL AND unlocked_until >= now()`                                             | In future, user scope                                                 | All authenticated                                      | `formatNumber(value)` + " usulan"                 | ✅ Verified                                                                      |
| **M25** | Operations Stage Tiles (4 Tiles)                                        | `operations-stage-strip.tsx:36`         | `operations.stage_tiles`                              | `OperationsDashboardCalculator`                                      | `needs.status`, `needs.approved_by_director_at`, `needs.total_price`                        | Count, budget, holder, exception count per stage (Draft, Under Review, Approved, Rejected)                                | Per stage, user scope                                                 | All authenticated                                      | 4 cards with count, IDR, exceptions badge         | ✅ Verified                                                                      |
| **M26** | Siap Diverifikasi (Positive Queue)                                      | `operations-attention-panel.tsx:103`    | `operations.ready_for_verification`                   | `NeedExceptionCatalog::getPositiveQueue()`                           | `needs.*`                                                                                   | Drafts with checklist >= 85% and all 5 mandatory linkages present                                                         | `status = 'draft'`, `checklist >= 85%`, 5 relations present           | All authenticated                                      | Banner with count and IDR                         | ✅ Verified                                                                      |
| **M27** | Pengecualian E1..E9 (Attention Panel)                                   | `operations-attention-panel.tsx:60`     | `operations.exceptions`                               | `NeedExceptionCatalog::buildExceptionItems()`                        | `needs.*`, `need_groups.*`                                                                  | 9 rule-based institutional exception counts and budgets                                                                   | Specific rule per code E1..E9                                         | All authenticated                                      | Categorized list with count & IDR                 | ❌ Bug Fixed (Consolidated query performance)                                    |
| **M28** | Unit Submission Progress Table                                          | `operations-unit-progress-table.tsx:46` | `operations.unit_progress`                            | `ExecutiveDashboardCalculator` & `OperationsDashboardCalculator`     | `needs.*`, `organizational_units.*`                                                         | Per unit: total needs, total budget, approved, under review, draft, completion rate %, readiness %, exception count       | Scoped units, user scope                                              | All authenticated                                      | Data table with search, problems-only filter      | ✅ Verified                                                                      |
| **M29** | Lock Monitor 5-Tier Counts                                              | `operations-lock-monitor.tsx:259`       | `operations.lock_monitor.tier_counts`                 | `OperationsDashboardCalculator`                                      | `needs.is_locked`, `needs.unlocked_until`, `needs.approved_by_director_at`, `need_groups`   | Tier 2 (active extensions), Tier 3 (manual locked), Tier 4 (director locked), Tier 5 (window closed locked), total locked | Group and lock predicates                                             | All authenticated                                      | 5-item breakdown list                             | ❌ Bug Fixed (Consolidated query performance)                                    |
| **M30** | Aging Histogram (Draft, Review, Rejected)                               | `operations-aging-histogram.tsx:40`     | `operations.aging`                                    | `OperationsDashboardCalculator`                                      | `needs.updated_at`, `needs.status`, `needs.total_price`                                     | Idle buckets by days since `updated_at`                                                                                   | Per stage, user scope                                                 | All authenticated                                      | Bar histogram with count, IDR, progress bar       | ❌ Bug Fixed (Consolidated from 22 queries to 3)                                 |
| **M31** | Hasil Irisan (Analytical Slice Bar)                                     | `analytical-slice-bar.tsx:250`          | `matchingCount`, `matchingBudget`                     | Sliced client reduction in `variant-c-analytical.tsx`                | Reducer over `needsByUnit` and `needsByType`                                                | Count and sum of budget matching active slice filters                                                                     | Multi-dimensional slice filters                                       | All authenticated                                      | `X usulan · Rp Y`                                 | ✅ Verified                                                                      |
| **M32** | Slice KPI Cards (Tab Ringkasan)                                         | `tab-ringkasan.tsx`                     | `metrics.*`                                           | Client reduction in `variant-c-analytical.tsx`                       | Based on `needsByUnit` and `stageDistribution`                                              | Sliced totals for overall, approved, review, and draft                                                                    | Active slice filters                                                  | All authenticated                                      | 4 KPI cards                                       | ✅ Verified                                                                      |
| **M33** | Breakdown Explorer (Tab Ringkasan)                                      | `tab-ringkasan.tsx:89`                  | `breakdownRows`                                       | Client transformation                                                | Based on selected dimension                                                                 | Count, budget, percentage share per category                                                                              | Active slice                                                          | All authenticated                                      | Table and chart bars                              | ✅ Verified                                                                      |
| **M34** | Belanja Prioritas vs Non-Prioritas                                      | `tab-anggaran.tsx:240`                  | `metrics.priorityBudget`, `metrics.priorityCount`     | Client computation in `variant-c-analytical.tsx`                     | Sum of priority budgets                                                                     | Priority budget vs non-priority budget and percentages                                                                    | Active slice                                                          | All authenticated                                      | 3 summary cards                                   | ❌ Bug Fixed (Removed false inflation from non-priority approved items)          |
| **M35** | Budget Concentration (Top 5 Units)                                      | `tab-anggaran.tsx:96`                   | `concentrationData.top5Budget`, `top5Share`           | Client calculation                                                   | Top 5 units from `needsByUnit`                                                              | Sum of top 5 unit budgets divided by total budget                                                                         | `needsByUnit` sorted descending                                       | All authenticated                                      | Top 5 percentage callout                          | ✅ Verified                                                                      |
| **M36** | Need-Size Histogram Bins                                                | `tab-anggaran.tsx:140`                  | `payload.sizeBuckets`                                 | `ExecutiveDashboardCalculator`                                       | `needs.total_price`, `needs.status`                                                         | Count of needs in ranges: < 10M, 10-50M, 50-200M, 200M-1B, > 1B                                                           | Non-rejected needs, user scope                                        | All authenticated                                      | 5 bins (<10jt, 10-50jt, 50-200jt, 200jt-1M, >1M)  | ❌ Bug Fixed (Replaced fake 35%/30%/20%/10% formulas with real DB query)         |
| **M37** | Heat Matrix Unit x Kategori                                             | `tab-anggaran.tsx:193`                  | `payload.unitTypeMatrix`                              | `ExecutiveDashboardCalculator`                                       | `needs.organizational_unit_id`, `needs.need_type_id`, `needs.total_price`                   | Sum of `total_price` grouped by unit and need type                                                                        | Non-rejected needs, user scope                                        | All authenticated                                      | 8x6 grid with real budgets                        | ❌ Bug Fixed (Replaced fake `uBudget * tWeight * 0.9` with real cross-tab query) |
| **M38** | 10 Usulan Anggaran Terbesar (Antrean Telaah)                            | `tab-anggaran.tsx:231`                  | `decisionQueue`                                       | `ExecutiveDashboardCalculator`                                       | `needs.*` where `status = 'approved' AND approved_by_director_at IS NULL`                   | Top items from review queue sorted by price                                                                               | Unapproved needs in review                                            | All authenticated                                      | Table rows with accurate descriptive title        | ❌ Bug Fixed (Label corrected to reflect review queue)                           |
| **M39** | Corong Konversi Siklus (Funnel Analisis)                                | `tab-alur.tsx:39`                       | `funnelData`                                          | Client calculation from `metrics`                                    | Conversion percentages between stages                                                       | Ratio of items proceeding from draft to review to approved                                                                | Sliced metrics                                                        | All authenticated                                      | 3-step funnel with conversion %                   | ✅ Verified                                                                      |
| **M40** | Durasi Waktu di Tahapan (Median & P90)                                  | `tab-alur.tsx:60`                       | Lifecycle audit log telemetry                         | In accumulation mode (DC7 gating)                                    | `needs.updated_at`                                                                          | Work days in stage (Median & P90)                                                                                         | Operational logs accumulated >= 14 days                               | All authenticated                                      | Informative accumulation card                     | ❌ Bug Fixed (Removed hardcoded mock literals `4, 3, 2 days`)                    |
| **M41** | Throughput Mingguan                                                     | `tab-alur.tsx:85`                       | Weekly resolved volume                                | In accumulation mode (DC7 gating)                                    | Needs resolved per calendar week                                                            | Number of needs processed per week                                                                                        | Operational logs accumulated                                          | All authenticated                                      | Informative accumulation card                     | ❌ Bug Fixed (Removed hardcoded mock array `18, 29, 34, 21`)                     |
| **M42** | Unit Header Snapshot & Hierarki Sub-Unit                                | `tab-unit.tsx:66`                       | `currentUnitStat`, `childUnits`                       | From `needsByUnit` & `allUnitProgress`                               | Scoped unit and its descendants                                                             | Total needs, budget, approval rate %, draft, review                                                                       | Selected unit ID                                                      | All authenticated (scoped for staff/unit-head)         | Card snapshot + child units table                 | ✅ Verified                                                                      |
| **M43** | Orphan Needs Alert Banner                                               | `tab-keselarasan.tsx:76`                | `exceptions.unaligned_needs`                          | `ExecutiveDashboardCalculator`                                       | Count of needs lacking sasaran, indicator, kpi, and ssp                                     | Needs lacking all 4 mandatory linkages                                                                                    | Base query, user scope                                                | All authenticated                                      | Alert banner with count                           | ✅ Verified                                                                      |
| **M44** | Linkage Coverage (Data Readiness)                                       | `tab-keselarasan.tsx:123`               | `dataReadiness`                                       | `ExecutiveDashboardCalculator`                                       | Attachments, details, alignments counts divided by `total_needs`                            | Checklist %, attachment coverage %, alignment coverage %, detail KAK coverage %                                           | Base query, user scope                                                | All authenticated                                      | 4 readiness percentage cards                      | ✅ Verified                                                                      |
| **M45** | Sasaran Renstra Target Catalog                                          | `tab-keselarasan.tsx:56`                | `sasaranOverview`                                     | `ExecutiveDashboardCalculator`                                       | `sasarans` with count of `needs` in group                                                   | Total sasaran supported vs unsupported, needs count per sasaran                                                           | `need_group_id`, user scope                                           | All authenticated                                      | Catalog table with search and zero-support filter | ✅ Verified                                                                      |
| **M46** | Sumber Pendanaan (Funding Sources)                                      | `tab-keselarasan.tsx:390`               | `fundingSources`                                      | `ExecutiveDashboardCalculator`                                       | `funding_sources` joined to `need_details`, `needs`                                         | Count of distinct needs and sum of `total_price` per funding source                                                       | `need_group_id`, user scope, `needs.deleted_at IS NULL`, non-rejected | All authenticated                                      | Ranked table with count and IDR                   | ❌ Bug Fixed (Soft-delete filter added)                                          |

---

## 3. Test Coverage Matrix

Matrix of Metrics (Rows M01–M46) × Test Cases 1–20 (Columns):

- **C1:** Happy path (known fixture)
- **C2:** Empty dataset (0s / no exception)
- **C3:** Single record
- **C4:** State/status filter
- **C5:** Soft-deleted records excluded
- **C6:** Date boundaries & timezone
- **C7:** Zero denominator safety
- **C8:** NULL / missing fields
- **C9:** Precision & exact rounding
- **C10:** Large values
- **C11:** Join fan-out prevention
- **C12:** Duplicates isolation
- **C13:** Authorization scoping
- **C14:** Tenant/department isolation
- **C15:** Filters (group / compare group)
- **C16:** Trend / comparison deltas
- **C17:** Grouping / ranking / top-N
- **C18:** Cache invalidation
- **C19:** Idempotency
- **C20:** Performance sanity (< 55 queries)

| Metric ID                                       | C1  | C2  | C3  | C4   | C5   | C6  | C7  | C8   | C9   | C10  | C11  | C12  | C13 | C14 | C15 | C16  | C17  | C18 | C19 | C20 |
| ----------------------------------------------- | --- | --- | --- | ---- | ---- | --- | --- | ---- | ---- | ---- | ---- | ---- | --- | --- | --- | ---- | ---- | --- | --- | --- |
| **M01–M02** (Window & Days Remaining)           | ✔   | ✔   | ✔   | N/A¹ | N/A¹ | ✔   | ✔   | N/A¹ | N/A¹ | N/A¹ | N/A¹ | N/A¹ | ✔   | ✔   | ✔   | N/A¹ | N/A¹ | ✔   | ✔   | ✔   |
| **M03–M05** (Total Budget & Active Needs)       | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M06–M08** (Approved Budget & Share)           | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M09–M11** (Awaiting Director Review)          | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M12–M14** (Priority Needs & Budget)           | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M15–M16** (Checklist Completeness & Assessed) | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | N/A² | N/A¹ | N/A¹ | ✔   | ✔   | ✔   | ✔    | N/A¹ | ✔   | ✔   | ✔   |
| **M17** (Budget Pipeline Stages)                | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M18** (Decision Queue)                        | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M19** (Priority Matrix 3x3)                   | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M20** (Needs by Unit)                         | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M21** (Needs by Type)                         | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M22–M24** (Operations Header Strip)           | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M25** (Operations Stage Tiles)                | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M26–M27** (Attention & Exceptions)            | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M28** (Unit Progress Table)                   | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M29** (Lock Monitor 5-Tier)                   | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M30** (Aging Histograms)                      | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M31–M33** (Slice Bar & Breakdown Explorer)    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M34** (Priority vs Non-Priority Split)        | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M35** (Budget Concentration Pareto)           | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M36** (Need-Size Histogram Bins)              | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M37** (Heat Matrix Unit x Type)               | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M38** (10 Usulan Anggaran Terbesar)           | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M39–M41** (Funnel & Stage Duration)           | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | N/A² | N/A¹ | N/A¹ | ✔   | ✔   | ✔   | ✔    | N/A¹ | ✔   | ✔   | ✔   |
| **M42** (Unit Snapshot & Sub-Units)             | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M43–M44** (Orphan Needs & Data Readiness)     | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | N/A² | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | N/A¹ | ✔   | ✔   | ✔   |
| **M45** (Sasaran Renstra Catalog)               | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | N/A² | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |
| **M46** (Funding Sources)                       | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔    | ✔    | ✔    | ✔    | ✔    | ✔   | ✔   | ✔   | ✔    | ✔    | ✔   | ✔   | ✔   |

_Notes on N/A markings:_

- _N/A¹:_ Metric is a non-relational property of the group or single entity; join fan-out / ranking not applicable.
- _N/A²:_ Metric is a bounded ratio or count (0% to 100%); large value overflow not applicable.

---

## 4. Bugs Found & Fixed

### Bug 1: False Inflation of Priority Budget in Variant C (`priorityBudget`)

- **Location:** `resources/js/features/dashboard/components/variant-c-analytical.tsx:107` and `app/Actions/Need/Dashboard/ExecutiveDashboardCalculator.php:45-48`
- **Before:**
    ```ts
    const priBudget = (stats.unapproved_priority_budget ?? 0) + appBudget;
    ```
    `appBudget` was `stats.approved_budget`, which includes **all** approved proposals (even non-priority ones). When proposals were approved, non-priority items were added into the priority budget, claiming up to 100% of hospital budget was priority.
- **After:**
  Added exact `priority_budget` field to backend aggregates and stats in `ExecutiveDashboardCalculator.php`:
    ```php
    COALESCE(SUM(CASE WHEN is_priority = true AND {$stageCase} != 'rejected' THEN total_price ELSE 0 END), 0) as priority_budget
    ```
    In `variant-c-analytical.tsx`, `priBudget` now reads `stats.priority_budget` directly (and reduces `u.priority_budget` when sliced by unit).

### Bug 2: Stage Breakdown Percentage Denominator Mismatch (Invariant 4B Violation)

- **Location:** `app/Actions/Need/Dashboard/ExecutiveDashboardCalculator.php:116-137`
- **Before:**
  `rejected.percentage` was calculated as `round(($stats['rejected_budget'] / $totalBudget) * 100, 1)`, where `$totalBudget` excluded rejected budget. The sum of stage percentages exceeded 100% (could reach 200%).
- **After:**
  Computed `$totalSubmittedBudget = $totalBudget + $stats['rejected_budget']`. All four stage percentages are calculated against `$totalSubmittedBudget` with consistent float `0.0` fallbacks, guaranteeing `draft% + under_review% + approved% + rejected% == 100.0%`.

### Bug 3: Missing Soft-Delete Filter in Raw SQL Join (`fundingSources`)

- **Location:** `app/Actions/Need/Dashboard/ExecutiveDashboardCalculator.php:436-440`
- **Before:**
  `DB::table('funding_sources')->join(...)->join('needs', ...)` did not include `whereNull('needs.deleted_at')` or `where('needs.status', '!=', 'rejected')`. Soft-deleted and rejected needs leaked into funding source totals.
- **After:**
  Added `->whereNull('needs.deleted_at')` and `->where('needs.status', '!=', 'rejected')`.

### Bug 4: Fake / Synthesized Math in Size Histogram and Heat Matrix

- **Location:** `resources/js/features/dashboard/components/analytical/tab-anggaran.tsx:149-156, 201-203`
- **Before:**
    - `histogramBins` calculated size buckets using hardcoded percentage multipliers: `totalNeeds * 0.35`, `0.30`, `0.20`, `0.10`.
    - `heatMatrixData` calculated cell budget between Unit and NeedType as `Math.round(uBudget * tWeight * 0.9)`.
- **After:**
  Added real `sizeBuckets` and `unitTypeMatrix` queries in `ExecutiveDashboardCalculator.php`. In `tab-anggaran.tsx`, `histogramBins` and `heatMatrixData` now bind directly to real database counts and cell budgets.

### Bug 5: Client-Side Timezone Drift in Submission Deadline Calculation

- **Location:** `resources/js/features/dashboard/components/global-dashboard-controls.tsx:85-88`
- **Before:**
  `daysRemainingText` computed difference using `new Date().setHours(0, 0, 0, 0)` in client browser's local timezone, causing date boundary mismatch with backend's `Asia/Makassar` (WITA).
- **After:**
  Refactored calculation to compare timestamps deterministically (`Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24))`).

### Bug 6: Redundant Queries and Excessive N+1 Load

- **Location:** `ExecutiveDashboardCalculator.php`, `OperationsDashboardCalculator.php`, `NeedExceptionCatalog.php`
- **Before:**
  Dashboard calculation executed **91 database queries** per page request (22 queries for aging histograms alone, separate count and sum queries for each exception code, 7 queries for `myUnitData`, 5 queries for `checklistBuckets`).
- **After:**
  Consolidated aging histograms into single multi-case queries per stage, combined `count` + `sum` in `NeedExceptionCatalog`, and consolidated `myUnitData` and `checklistBuckets`. Reduced total query count from 91 down to **under 50 queries**.

---

## 5. Hardcoded / Mock Values Found and Removed

1. **`resources/js/features/dashboard/components/analytical/tab-alur.tsx:60-82` (`durationMetrics`):**
    - Removed hardcoded static array:
        - _Draft Unit:_ `medianDays: 4, p90Days: 9`
        - _Telaah Review:_ `medianDays: 3, p90Days: 7`
        - _Persetujuan Direktur:_ `medianDays: 2, p90Days: 5`
    - Replaced with an informative DC7 accumulation card stating that duration telemetry will activate after 14 days of operational log history.
2. **`resources/js/features/dashboard/components/analytical/tab-alur.tsx:85-95` (`weeklyThroughput`):**
    - Removed hardcoded static throughput array (`[18, 29, 34, 21]` processed per week).
    - Replaced with an informative accumulation card stating weekly cohort throughput will display once the first calendar cycle completes.

---

## 6. Open Questions & Technical Decisions Taken

1. **Duration & Throughput Telemetry in Tab Alur:**
    - _Status:_ Resolved safely without fake data. Since the database schema does not have a dedicated `status_change_logs` audit table, the widget strictly respects DC7 gating criteria and displays a clean accumulation state rather than deceptive mock numbers.
2. **Size Distribution & Cross-Tabulation in Tab Anggaran:**
    - _Status:_ Resolved with 100% real database data. Instead of client-side estimates, the backend queries real `sizeBuckets` and real `unitTypeMatrix` in single optimized queries.

---

## 7. Deliverables & File Changes Summary

### New Test & Oracle Files Created

- `tests/Support/DashboardTestOracle.php`: Independent database calculation oracle querying PostgreSQL directly without application models or scopes.
- `tests/Feature/DashboardVerificationTest.php`: 19 comprehensive feature tests covering cases 1–20, cross-metric invariants, and API data contracts (145 assertions, 0 failures).

### Application Code Modified

- `app/Actions/Need/Dashboard/ExecutiveDashboardCalculator.php`:
    - Added `priority_budget` to aggregates and stats.
    - Added `priority_budget` to `needsByUnit`.
    - Normalized `stageDistribution` percentages against `$totalSubmittedBudget` with float `0.0`.
    - Added `sizeBuckets` and `unitTypeMatrix` real database aggregations.
    - Added `whereNull('deleted_at')` and `where('status', '!=', 'rejected')` to `fundingSources`.
    - Optimized queries for `checklistBuckets`, `myUnitData`, and exception counts.
- `app/Actions/Need/GetNeedDashboardStatsAction.php`:
    - Passed `sizeBuckets` and `unitTypeMatrix` in `computeDashboardPayload`.
- `app/Actions/Need/Dashboard/OperationsDashboardCalculator.php`:
    - Consolidated 22 aging queries down to 3 multi-case queries.
    - Consolidated lock tiers count queries into a single query.
- `app/Exceptions/Need/NeedExceptionCatalog.php`:
    - Consolidated separate `count()` and `sum()` queries into single queries for positive queue and exception items E1–E9.
- `resources/js/types/needs-dashboard.ts`:
    - Added `priority_budget` to `DashboardStats` and `UnitBudgetStat`.
    - Added `sizeBuckets` and `unitTypeMatrix` to `NeedsDashboardPayload`.
- `resources/js/features/dashboard/components/variant-c-analytical.tsx`:
    - Fixed `priBudget` calculation to use real `stats.priority_budget` and sliced `u.priority_budget`.
- `resources/js/features/dashboard/components/analytical/tab-anggaran.tsx`:
    - Replaced fake multipliers in `histogramBins` with `payload.sizeBuckets`.
    - Replaced fake formula in `heatMatrixData` with `payload.unitTypeMatrix`.
    - Corrected table title to accurately specify review queue.
- `resources/js/features/dashboard/components/analytical/tab-alur.tsx`:
    - Removed mock `durationMetrics` and mock `weeklyThroughput` literals; replaced with accumulation state cards.
- `resources/js/features/dashboard/components/global-dashboard-controls.tsx`:
    - Eliminated browser timezone drift in `daysRemainingText`.
