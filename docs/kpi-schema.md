# KPI Database Schema

This document provides a reference for the KPI management system's database schema.

## Tables

### 1. `kpi_groups`
Planning period group for a set of KPIs.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | | Primary Key |
| `name` | `VARCHAR(255)` | No | | Name of the planning period |
| `description` | `TEXT` | Yes | | Optional details |
| `start_year` | `SMALLINT` | No | | First planning year |
| `end_year` | `SMALLINT` | No | | Last planning year |
| `is_active` | `BOOLEAN` | No | `TRUE` | Whether this group is the current active one |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | |

**Constraints & Indexes:**
- `chk_kpi_groups_year_range`: `CHECK (end_year >= start_year)`
- `uq_kpi_groups_single_active`: `UNIQUE (is_active) WHERE is_active = TRUE` (Only one active group allowed)

---

### 2. `kpi_indicators`
KPI rows; can be category headers or measurable indicators.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | | Primary Key |
| `group_id` | `BIGINT` | No | | Foreign Key to `kpi_groups` |
| `parent_indicator_id` | `BIGINT` | Yes | | Self-reference for hierarchy |
| `name` | `TEXT` | No | | Indicator name |
| `unit` | `VARCHAR(100)` | Yes | | Measurement unit (e.g., %, Score) |
| `is_category` | `BOOLEAN` | No | `FALSE` | If true, serves as a header/parent only |
| `baseline_value` | `VARCHAR(32)` | Yes | | Baseline value (usually from `start_year - 1`) |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | |

**Constraints & Indexes:**
- `chk_kpi_indicators_category_no_unit`: Category indicators cannot have a unit or baseline value.
- `idx_kpi_indicators_group_id`: Index for performance.
- `idx_kpi_indicators_parent_id`: Index for hierarchical lookups.

---

### 3. `kpi_annual_targets`
Per-year target values for each indicator.

| Column | Type | Nullable | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | No | | Primary Key |
| `indicator_id` | `BIGINT` | No | | Foreign Key to `kpi_indicators` |
| `year` | `SMALLINT` | No | | Target year |
| `target_value` | `VARCHAR(32)` | Yes | | Target value for the year |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | |

**Constraints & Indexes:**
- `uq_kpi_annual_targets_indicator_year`: Unique combination of indicator and year.
- `idx_kpi_annual_targets_indicator_id`: Index for lookups.
- `trg_kpi_annual_targets_year_range`: Trigger validation ensure `year` is within the associated group's range.
