# Database Table Schema

This document provides a comprehensive overview of the database tables and their schemas in the application, extracted from the migration files.

## Table of Contents
- [Core Application Tables](#core-application-tables)
  - [organizational_units](#organizational_units)
  - [need_types](#need_types)
  - [needs](#needs)
- [Strategic Planning Tables](#strategic-planning-tables)
  - [renstras](#renstras)
  - [tujuans](#tujuans)
  - [sasarans](#sasarans)
  - [indicators](#indicators)
  - [indicator_targets](#indicator_targets)
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

### `needs`
Stores the actual requests or needs from organizational units.
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| organizational_unit_id | bigint | No | Foreign Key (organizational_units) |
| need_type_id | bigint | No | Foreign Key (need_types) |
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
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |
| deleted_at | timestamp | Yes | Soft Deletes |

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

---

## System Tables

### `users`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| name | string | No | |
| email | string | No | Unique |
| email_verified_at | timestamp | Yes | |
| password | string | No | |
| two_factor_secret | text | Yes | |
| two_factor_recovery_codes | text | Yes | |
| two_factor_confirmed_at | timestamp | Yes | |
| remember_token | string(100) | Yes | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

### `password_reset_tokens`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| email | string | No | Primary Key |
| token | string | No | |
| created_at | timestamp | Yes | |

### `sessions`
| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | string | No | Primary Key |
| user_id | bigint | Yes | Foreign Key (users), index |
| ip_address | string(45) | Yes | |
| user_agent | text | Yes | |
| payload | longText | No | |
| last_activity | integer | No | Index |

### `cache`
- **cache**: `key` (PK), `value`, `expiration`
- **cache_locks**: `key` (PK), `owner`, `expiration`

### `jobs`
- **jobs**: `id`, `queue` (index), `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`
- **job_batches**: `id`, `name`, `total_jobs`, `pending_jobs`, `failed_jobs`, `failed_job_ids`, `options`, `cancelled_at`, `created_at`, `finished_at`
- **failed_jobs**: `id`, `uuid` (unique), `connection`, `queue`, `payload`, `exception`, `failed_at`
