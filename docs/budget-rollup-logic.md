# Budget Rollup (Bubble-Up) Logic

This document explains how the application handles budget aggregation across the hierarchical planning tree.

## Overview

The "bubble-up" logic ensures that any change to a budget at a lower level is accurately reflected in its parent levels. This is handled asynchronously via background jobs to maintain performance.

The system maintains **two independent rollup lanes** — manual budget and computed budget — that propagate upward through the hierarchy without interfering with each other.

## Related Files

### 1. Database Schema

- **Migration**: `database/migrations/2026_04_12_170140_add_total_budget_to_planning_activity_years_table.php`  
  Adds `total_budget` (decimal) to the `planning_activity_years` table to store computed aggregates separately from manual inputs.

### 2. Models & Observers

- **Models**: [PlanningActivityVersion.php](app/Models/PlanningActivityVersion.php), [PlanningActivityYear.php](app/Models/PlanningActivityYear.php)
- **Observers**:
    - [PlanningActivityYearObserver.php](app/Observers/PlanningActivityYearObserver.php): Listens for changes to budget values.
    - [PlanningActivityVersionObserver.php](app/Observers/PlanningActivityVersionObserver.php): Listens for changes to the hierarchy (`parent_id`).
    - Registered in [AppServiceProvider.php](app/Providers/AppServiceProvider.php).

### 3. Core Logic

- **Queue Job**: [CalculateActivityBudgetJob.php](app/Jobs/CalculateActivityBudgetJob.php)  
  Contains the recursive traversal logic. It iterates up the tree, calculating the sum of direct children's budgets.
- **Action**: [CalculateActivityBudgetAction.php](app/Actions/Planning/CalculateActivityBudgetAction.php)  
  A single entry point to dispatch the job.

### 4. Controller (Manual Trigger)

- **Controller**: [PlanningActivityVersionController.php](app/Http/Controllers/Planning/PlanningActivityVersionController.php)  
  Contains `recalculateAll` which finds all leaf nodes and schedules their budget rollups.

### 5. Frontend & Visualization

- **Component**: [yearly-data-cell.tsx](resources/js/pages/planning/activity-versions/yearly-data-cell.tsx)  
  Handles formatting and visual feedback for budget data.

---

## Core Logic Principles

### 1. Asynchronous Execution

Budget calculations are dispatched to the **Redis queue**. This ensures that saving a budget or importing data doesn't timeout the user's browser, even with complex hierarchies.

### 2. Independent Parallel Rollups

The system maintains two strictly independent aggregation paths. A change in a manual `budget` field only affects the parent's `budget` chain, and a change in a `total_budget` field only affects the parent's `total_budget` chain.

#### A. Manual Budget Rollup (Manual → Manual)

Propagation rules for manual `budget`:

| Trigger | Action |
| :--- | :--- |
| **Subkegiatan** manual budget updated | → update **Kegiatan** manual budget → update **Program** manual budget |
| **Kegiatan** manual budget updated | → update **Program** manual budget |
| **Outcome (Program)** updated | → **do nothing** |
| **Output (Kegiatan)** updated | → **do nothing** |

- **Logic**: `Parent->budget = SUM(children->budget)`
- Subkegiatan is the primary input source — its `budget` is never overwritten by rollups.
- Outcome (Program) and Output (Kegiatan) types are **excluded** from manual budget propagation — editing them does not trigger any rollup.

#### B. Computed Budget Rollup (Computed → Computed)

Propagation rules for computed `total_budget`:

| Trigger | Action |
| :--- | :--- |
| **Output (Subkegiatan)** updated | → compute **Subkegiatan** `total_budget` → update **Kegiatan** computed budget → update **Program** computed budget |
| **Outcome (Program)** updated | → **do nothing** |
| **Output (Kegiatan)** updated | → **do nothing** |

- **Logic**: `Parent->total_budget = SUM(children->total_budget)`
- **Base Case**: Subkegiatan's `total_budget` is computed from its own Output children. For activities whose children are "Subkegiatan Output" (which don't have `total_budget`), the rollup uses the child's `budget` as the seed value.

```php
// Rollup Path 1: Manual to Manual
$manualTotal = $childYears->sum('budget');

// Rollup Path 2: Computed to Computed
$computedTotal = $childYears->sum(function($child) {
    // Leaf nodes (Subkegiatan) don't have total_budget, so we use their budget as the seed for the parent's total.
    return $child->total_budget ?? $child->budget ?? 0;
});
```

**Example — Manual budget rollup:**
| Activity | Manual Budget | Action |
| :--- | :--- | :--- |
| Sub-A | **100** | *user sets* |
| Sub-B | **200** | *user sets* |
| **Kegiatan** | **300** *(sum of children)* | *auto-calculated* |
| **Program** | **300** *(sum of children)* | *auto-calculated* |

**Now, if you manually override Kegiatan to 500:**
| Activity | Manual Budget | Computed Total | Note |
| :--- | :--- | :--- | :--- |
| Kegiatan | **500** | 300 | Override created |
| Program | **500** *(sum of budgets: 500)* | **300** *(sum of totals: 300)* | Propagates correctly |

**Example — Computed budget rollup:**
| Activity | Computed Total | Action |
| :--- | :--- | :--- |
| Subkegiatan Output X | budget=50 | *user sets output budget* |
| Subkegiatan Output Y | budget=70 | *user sets output budget* |
| **Subkegiatan** | **120** *(sum of outputs)* | *auto-calculated* |
| **Kegiatan** | **120** *(sum of children totals)* | *auto-calculated* |
| **Program** | **120** *(sum of children totals)* | *auto-calculated* |


### 3. Race Condition Prevention

The job uses `DB::transaction()` with `lockForUpdate()` on the parent records during calculation. This ensures that if multiple children are updated simultaneously, their updates to the parent don't conflict or overwrite each other with stale sums.

### 4. Data Integrity (Tree Changes)

When an activity's `parent_id` is updated (e.g., moved to a different program), the `PlanningActivityVersionObserver` automatically triggers a recalculation for:

1. The **old parent chain** (to deduct the values).
2. The **new parent chain** (to add the values).

### 5. Visual Mismatch Indicators (Frontend)

When a parent has both a manual `budget` and a computed `total_budget`, the UI displays a small **Σ badge** with soft-colored indicators based on the difference:

- <span style="color:#ef4444; background:rgba(239,68,68,0.1); padding:2px 4px; border-radius:4px">**Red Badge**</span>: Computed total > Manual input.
- <span style="color:#10b981; background:rgba(16,185,129,0.1); padding:2px 4px; border-radius:4px">**Green Badge**</span>: Computed total < Manual input.
- **Default Badge**: Values match.
- **Hover**: Tooltips provide detailed breakdown of the mismatch.
