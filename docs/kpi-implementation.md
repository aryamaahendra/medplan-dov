# KPI Backend Implementation
 
This document describes the backend implementation for the KPI management system.
 
## Overview
 
The KPI system allows managing planning periods (Groups) and their associated performance indicators. Indicators can be organized into categories and have annual targets spanning the group's year range.
 
## Key Components
 
### 1. Models
- **KpiGroup**: Represents a planning period (e.g., "Health Affairs 2024–2030").
- **KpiIndicator**: Represents a specific KPI or a category header. Supports hierarchy via `parent_indicator_id`.
- **KpiAnnualTarget**: Stores yearly targets for an indicator.
 
### 2. Controllers & Routing
- **KpiGroupController**: Handles CRUD for planning periods.
  - **Activate Route**: `POST /kpis/groups/{group}/activate` - Sets a group as the single active one, automatically deactivating others.
- **KpiIndicatorController**: Handles CRUD for indicators.
  - Automatically syncs `annual_targets` during store and update.
 
### 3. Validation Rules
- **Date Range**: `end_year` must be greater than or equal to `start_year`.
- **Category Constraints**: If `is_category` is true, the indicator cannot have a `unit` or `baseline_value`.
- **Single Active**: Enforcement of only one active group at a time is handled via database unique context-sensitive index and controller logic.
 
## Database Integrity
- **Check Constraints**:
  - `chk_kpi_groups_year_range`: Ensures `end_year >= start_year`.
  - `chk_kpi_indicators_category_no_unit`: Ensures categories don't have measurement units.
- **Triggers**:
  - `trg_kpi_annual_targets_year_range`: Validates that a target year is within the associated group's start and end years.
- **Indexes**:
  - `uq_kpi_groups_single_active`: Partial unique index on `is_active` where true.
 
## Testing
 
Feature tests are available at:
- `tests/Feature/KpiGroupTest.php`
- `tests/Feature/KpiIndicatorTest.php`
 
Run tests with:
```bash
./vendor/bin/sail test --filter=Kpi
```
