# Planning Activities Table Schema

This document provides the detailed schema for the `planning_activities` table, which manages the government planning hierarchy (Programs, Activities, Sub-Activities, and Outputs).

## `planning_activities`

Stores the hierarchical structure of programs, activities, sub-activities, and outputs.

| Column | Type | Nullable | Extra |
| :--- | :--- | :---: | :--- |
| id | bigint | No | Primary Key |
| code | string | Yes | Index - Nomenklatur code (e.g., 1.01) |
| name | text | No | Name of the program, activity, or output |
| parent_id | bigint | Yes | Foreign Key (planning_activities), cascadeOnDelete |
| type | enum | No | 'program', 'activity', 'sub_activity', 'output' |
| full_code | string | Yes | Combined hierarchy code |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

## Hierarchy Rules

1. **Program**: The top-level item (`parent_id` is null).
2. **Activity**: Belongs to a Program.
3. **Sub Activity**: Belongs to an Activity.
4. **Output**: Belongs to a Sub Activity.

## Related Models

- **Model**: `App\Models\PlanningActivity`
- **Migration**: `database/migrations/2026_04_10_025309_create_planning_activities_table.php`
