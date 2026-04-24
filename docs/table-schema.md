# Database Table Schema

This document provides a comprehensive overview of the database tables and their schemas in the application, extracted from the migration files.

## Table of Contents

- [Core Application Tables](#core-application-tables)
    - [organizational_units](#organizational_units)
    - [need_types](#need_types)
    - [need_groups](#need_groups)
    - [needs](#needs)
    - [need_details](#need_details)
    - [need_attachments](#need_attachments)
    - [need_sasaran](#need_sasaran)
    - [need_indicator](#need_indicator)
- [Strategic Planning Tables](#strategic-planning-tables)
    - [renstras](#renstras)
    - [tujuans](#tujuans)
    - [sasarans](#sasarans)
    - [indicators](#indicators)
    - [indicator_targets](#indicator_targets)
    - [strategic_service_plans](#strategic_service_plans)
    - [need_strategic_service_plan](#need_strategic_service_plan)
- [KPI Management Tables](#kpi-management-tables)
    - [kpi_groups](#kpi_groups)
    - [kpi_indicators](#kpi_indicators)
    - [kpi_annual_targets](#kpi_annual_targets)
    - [kpi_indicator_need](#kpi_indicator_need)
- [Planning Hierarchy Tables](#planning-hierarchy-tables)
    - [planning_versions](#planning_versions)
    - [planning_activity_versions](#planning_activity_versions)
    - [planning_activity_indicators](#planning_activity_indicators)
    - [planning_activity_years](#planning_activity_years)
    - [need_planning_activity_version](#need_planning_activity_version)
    - [need_planning_activity_indicator](#need_planning_activity_indicator)
- [Checklist Management Tables](#checklist-management-tables)
    - [checklist_questions](#checklist_questions)
    - [need_group_checklist_question](#need_group_checklist_question)
    - [need_checklist_answers](#need_checklist_answers)
- [Permission Management Tables](#permission-management-tables)
    - [permissions](#permissions)
    - [roles](#roles)
    - [model_has_permissions](#model_has_permissions)
    - [model_has_roles](#model_has_roles)
    - [role_has_permissions](#role_has_permissions)
- [System Tables](#system-tables)
    - [users](#users)
    - [password_reset_tokens](#password_reset_tokens)
    - [sessions](#sessions)
    - [cache](#cache)
    - [jobs](#jobs)

---

## Core Application Tables

### `organizational_units`

Stores the hierarchical structure of organizational units.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| name | string | No | |
| code | string | No | Unique |
| parent_id | bigint | Yes | Foreign Key (organizational_units), nullOnDelete |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |
| deleted_at | timestamp | Yes | Soft Deletes |

### `need_types`

Stores categories or types of needs.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| name | string | No | |
| code | string | No | Unique |
| description | text | Yes | |
| is_active | boolean | No | Default: true |
| order_column | integer | No | Default: 0 |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |
| deleted_at | timestamp | Yes | Soft Deletes |

### `need_groups`

Stores groups of needs for a specific year.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| name | string | No | |
| description | text | Yes | |
| year | unsignedSmallInteger | No | |
| is_active | boolean | No | Default: true |
| need_count | unsignedInteger | No | Default: 0 |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |
| deleted_at | timestamp | Yes | Soft Deletes |

### `needs`

Stores the actual requests or needs from organizational units.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| need_group_id | bigint | No | Foreign Key (need_groups), cascadeOnDelete |
| organizational_unit_id | bigint | No | Foreign Key (organizational_units), cascadeOnDelete |
| need_type_id | bigint | No | Foreign Key (need_types), cascadeOnDelete |
| year | unsignedSmallInteger | No | |
| title | string | No | |
| description | text | Yes | |
| current_condition | text | Yes | |
| required_condition | text | Yes | |
| volume | decimal(15,4) | No | |
| unit | string(50) | No | |
| unit_price | decimal(15,2) | No | |
| total_price | decimal(15,2) | No | |
| urgency | string(20) | No | Default: 'medium' |
| impact | string(20) | No | Default: 'medium' |
| is_priority | boolean | No | Default: false |
| status | string(20) | No | Default: 'draft' |
| checklist_percentage | decimal(5,2) | No | Default: 0 |
| notes | text | Yes | |
| approved_by_director_at | timestamp | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |
| deleted_at | timestamp | Yes | Soft Deletes |

### `need_details`

Stores proposal/document-style fields for a need (1:1 relationship with needs).
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| need_id | bigint | No | Foreign Key (needs), cascadeOnDelete, Unique |
| background | text | Yes | |
| purpose_and_objectives | text | Yes | |
| target_objective | text | Yes | |
| procurement_organization_name | text | Yes | |
| funding_source_and_estimated_cost | text | Yes | |
| implementation_period | text | Yes | |
| expert_or_skilled_personnel | text | Yes | |
| technical_specifications | text | Yes | |
| training | text | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `need_attachments`

Stores file attachments related to a need.

| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| need_id | bigint | No | Foreign Key (needs), cascadeOnDelete |
| category | string | No | Default: 'general' |
| display_name | string | No | |
| file_path | string | No | |
| file_size | unsignedBigInteger | No | |
| mime_type | string | No | |
| extension | string | No | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `need_sasaran`

Pivot table connecting needs and strategic targets.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| need_id | bigint | No | Foreign Key (needs), cascadeOnDelete |
| sasaran_id | bigint | No | Foreign Key (sasarans), cascadeOnDelete |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `need_indicator`

Pivot table connecting needs and performance indicators.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| need_id | bigint | No | Foreign Key (needs), cascadeOnDelete |
| indicator_id | bigint | No | Foreign Key (indicators), cascadeOnDelete |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

---

## Strategic Planning Tables

### `renstras`

Stores strategic planning periods.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| name | string | No | |
| year_start | integer | No | |
| year_end | integer | No | |
| description | text | Yes | |
| is_active | boolean | No | Default: true |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `tujuans`

Stores strategic objectives (Tujuan).
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| renstra_id | bigint | No | Foreign Key (renstras), cascadeOnDelete |
| name | string | No | |
| description | text | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `sasarans`

Stores strategic targets (Sasaran).
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| tujuan_id | bigint | No | Foreign Key (tujuans), cascadeOnDelete |
| name | string | No | |
| description | text | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `indicators`

Stores performance indicators for objectives or targets.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| tujuan_id | bigint | Yes | Foreign Key (tujuans), cascadeOnDelete |
| sasaran_id | bigint | Yes | Foreign Key (sasarans), cascadeOnDelete |
| name | string | No | |
| baseline | string | Yes | |
| description | text | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `indicator_targets`

Stores annual targets for performance indicators.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| indicator_id | bigint | No | Foreign Key (indicators), cascadeOnDelete |
| year | integer | No | |
| target | string | No | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `strategic_service_plans`

Stores strategic service plans including programs, targets, and policy directions.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| year | unsignedSmallInteger | No | CHECK (year >= 2000) |
| strategic_program | string(255) | No | |
| service_plan | text | No | |
| target | text | No | |
| policy_direction | text | No | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |
| deleted_at | timestamp | Yes | Soft Deletes |

### `need_strategic_service_plan`

Pivot table connecting needs and strategic service plans.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| need_id | bigint | No | Foreign Key (needs), cascadeOnDelete |
| strategic_service_plan_id | bigint | No | Foreign Key (strategic_service_plans), cascadeOnDelete |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

---

## KPI Management Tables

### `kpi_groups`

Stores planning periods for KPIs.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| name | string(255) | No | |
| description | text | Yes | |
| start_year | smallint | No | |
| end_year | smallint | No | CHECK (end_year >= start_year) |
| is_active | boolean | No | Default: true, Unique partial index |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `kpi_indicators`

Stores the hierarchical performance indicators.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| group_id | bigint | No | Foreign Key (kpi_groups), cascadeOnDelete |
| parent_indicator_id | bigint | Yes | Self-reference (kpi_indicators), cascadeOnDelete |
| name | text | No | |
| unit | string(100) | Yes | |
| is_category | boolean | No | Default: false, CHECK constraints apply |
| baseline_value | string(32) | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `kpi_annual_targets`

Stores yearly target values for indicators.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| indicator_id | bigint | No | Foreign Key (kpi_indicators), cascadeOnDelete |
| year | smallint | No | Distinct year per indicator |
| target_value | string(32) | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `kpi_indicator_need`

Pivot table connecting KPI indicators and needs.

| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| kpi_indicator_id | bigint | No | Foreign Key (kpi_indicators), cascadeOnDelete |
| need_id | bigint | No | Foreign Key (needs), cascadeOnDelete |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

---

## Planning Hierarchy Tables

### `planning_versions`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| name | string | No | |
| year_start | integer | No | |
| year_end | integer | No | |
| revision_no | integer | No | |
| status | enum | No | 'draft', 'submitted', 'approved', 'archived', Default: 'draft' |
| is_current | boolean | No | Default: false |
| notes | text | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `planning_activity_versions`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| planning_version_id | bigint | No | Foreign Key (planning_versions), cascadeOnDelete |
| parent_id | bigint | Yes | Foreign Key (self), nullOnDelete |
| code | string | Yes | Index |
| type | string | Yes | |
| name | text | No | |
| full_code | string | Yes | |
| perangkat_daerah | string | Yes | |
| keterangan | text | Yes | |
| sort_order | integer | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `planning_activity_indicators`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| planning_activity_version_id | bigint | No | Foreign Key (planning_activity_versions), cascadeOnDelete |
| name | text | No | |
| baseline | string | Yes | |
| unit | string | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `planning_activity_years`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| yearable_id | bigint | No | Polymorphic ID |
| yearable_type | string | No | Polymorphic Type |
| year | integer | No | Unique per yearable |
| target | string | Yes | Nullable (used for indicators) |
| budget | decimal(20,2) | Yes | Nullable (used for activities) |
| total_budget | decimal(20,2) | Yes | Nullable (used for activities) |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `need_planning_activity_version`

Pivot table connecting needs and planning activity versions.

| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| need_id | bigint | No | Foreign Key (needs), cascadeOnDelete |
| planning_activity_version_id | bigint | No | Foreign Key (planning_activity_versions), cascadeOnDelete |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `need_planning_activity_indicator`

Pivot table connecting needs and planning activity indicators.

| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| need_id | bigint | No | Foreign Key (needs), cascadeOnDelete |
| planning_activity_indicator_id | bigint | No | Foreign Key (planning_activity_indicators), cascadeOnDelete |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

---

## Checklist Management Tables

### `checklist_questions`

Stores general checklist questions that can be assigned to need groups.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| question | text | No | |
| description | text | Yes | |
| is_active | boolean | No | Default: true |
| order_column | integer | No | Default: 0 |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |
| deleted_at | timestamp | Yes | Soft Deletes |

### `need_group_checklist_question`

Pivot table connecting need groups and checklist questions, allowing group-specific configuration.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| need_group_id | bigint | No | Foreign Key (need_groups), cascadeOnDelete |
| checklist_question_id | bigint | No | Foreign Key (checklist_questions), cascadeOnDelete |
| order_column | integer | No | Default: 0 |
| is_required | boolean | No | Default: false |
| is_active | boolean | No | Default: true |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `need_checklist_answers`

Stores the answers to checklist questions for each individual need.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| need_id | bigint | No | Foreign Key (needs), cascadeOnDelete |
| checklist_question_id | bigint | No | Foreign Key (checklist_questions), cascadeOnDelete |
| answer | string | Yes | Usually 'yes', 'no', or 'n/a' |
| notes | text | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

---

## Permission Management Tables

### `permissions`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| name | string | No | |
| guard_name | string | No | |
| description | string | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `roles`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| name | string | No | |
| guard_name | string | No | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `model_has_permissions`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| permission_id | bigint | No | Foreign Key (permissions), cascadeOnDelete |
| model_type | string | No | |
| model_id | bigint | No | |

### `model_has_roles`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| role_id | bigint | No | Foreign Key (roles), cascadeOnDelete |
| model_type | string | No | |
| model_id | bigint | No | |

### `role_has_permissions`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| permission_id | bigint | No | Foreign Key (permissions), cascadeOnDelete |
| role_id | bigint | No | Foreign Key (roles), cascadeOnDelete |

---

## System Tables

### `users`

| Column                    | Type        | Nullable | Extra       |
| :------------------------ | :---------- | :------: | :---------- |
| id                        | bigint      |    No    | Primary Key |
| name                      | string      |    No    |             |
| email                     | string      |    No    | Unique      |
| nip                       | string      |   Yes    |             |
| email_verified_at         | timestamp   |   Yes    |             |
| password                  | string      |    No    |             |
| organizational_unit_id    | bigint      |   Yes    | Foreign Key (organizational_units), nullOnDelete |
| two_factor_secret         | text        |   Yes    |             |
| two_factor_recovery_codes | text        |   Yes    |             |
| two_factor_confirmed_at   | timestamp   |   Yes    |             |
| remember_token            | string(100) |   Yes    |             |
| created_at                | timestamp   |   Yes    |             |
| updated_at                | timestamp   |   Yes    |             |

### `password_reset_tokens`

| Column     | Type      | Nullable | Extra       |
| :--------- | :-------- | :------: | :---------- |
| email      | string    |    No    | Primary Key |
| token      | string    |    No    |             |
| created_at | timestamp |   Yes    |             |

### `sessions`

| Column        | Type       | Nullable | Extra                      |
| :------------ | :--------- | :------: | :------------------------- |
| id            | string     |    No    | Primary Key                |
| user_id       | bigint     |   Yes    | Foreign Key (users), index |
| ip_address    | string(45) |   Yes    |                            |
| user_agent    | text       |   Yes    |                            |
| payload       | longText   |    No    |                            |
| last_activity | integer    |    No    | Index                      |

### `cache`

- **cache**: `key` (PK), `value`, `expiration`
- **cache_locks**: `key` (PK), `owner`, `expiration`

### `jobs`

- **jobs**: `id`, `queue` (index), `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`
- **job_batches**: `id`, `name`, `total_jobs`, `pending_jobs`, `failed_jobs`, `failed_job_ids`, `options`, `cancelled_at`, `created_at`, `finished_at`
- **failed_jobs**: `id`, `uuid` (unique), `connection`, `queue`, `payload`, `exception`, `failed_at`
