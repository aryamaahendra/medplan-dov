# Planning Versioning Backend CRUD Guide

This document explains how to implement and interact with the dynamic planning versioning system.

## 1. Creating a New Revision

When a user wants to create a new revision (e.g., shifting from "Original" to "Revision 1"), you should NOT modify the existing version. Instead, create a new snapshot.

### Copying Logic
1. Create a new `PlanningVersion` record (increment `revision_no`).
2. Fetch all `PlanningActivityVersion` records from the previous version.
3. For each record:
    - Create a new `PlanningActivityVersion` linked to the new `PlanningVersion`.
    - Link it to the same `source_activity_id`.
    - Copy all metadata fields (`code`, `name`, `indicator_name`, etc.).
    - Fetch all `PlanningActivityYear` records for that item and create copies linked to the new versioned activity.

### Example Code (Controller Logic)
```php
public function createRevision(PlanningVersion $oldVersion)
{
    DB::transaction(function () use ($oldVersion) {
        // 1. New Version Header
        $newVersion = PlanningVersion::create([
            'name' => $oldVersion->name . ' Revision ' . ($oldVersion->revision_no + 1),
            'fiscal_year' => $oldVersion->fiscal_year,
            'revision_no' => $oldVersion->revision_no + 1,
            'status' => 'draft',
            'is_current' => false,
        ]);

        // 2. Clone Activity Snaphots
        $oldActivityVersions = $oldVersion->activityVersions()->get();
        
        foreach ($oldActivityVersions as $oldAV) {
            $newAV = $oldAV->replicate();
            $newAV->planning_version_id = $newVersion->id;
            $newAV->save();

            // 3. Clone Yearly Targets/Budgets
            foreach ($oldAV->activityYears as $oldYear) {
                $newYear = $oldYear->replicate();
                $newYear->planning_activity_version_id = $newAV->id;
                $newYear->save();
            }
        }
    });

    return redirect()->back()->with('success', 'Revision created.');
}
```

---

## 2. Managing Yearly Data

Since years are dynamic rows, updates involve `updateOrCreate` patterns.

### Updating a Target/Budget
```php
public function updateYearlyData(PlanningActivityVersion $activityVersion, Request $request)
{
    $request->validate([
        'year' => 'required|integer',
        'target' => 'required|string',
        'budget' => 'required|numeric',
    ]);

    $activityVersion->activityYears()->updateOrCreate(
        ['year' => $request->year],
        [
            'target' => $request->target,
            'budget' => $request->budget,
        ]
    );
}
```

---

## 3. Querying Data

To display the planning table for a specific version:

```php
$version = PlanningVersion::where('is_current', true)->first();

$activities = PlanningActivityVersion::where('planning_version_id', $version->id)
    ->with('activityYears')
    ->orderBy('sort_order')
    ->get();
```

---

## 4. Best Practices
- **Immutability**: Once a version is 'approved', it should ideally be locked (read-only).
- **Revision Groups**: Use `PlanningRevisionGroup` to track *why* a set of changes happened (e.g., "Adjusted for Inflation April 2026").
- **Cascading**: Always use transactions when creating revisions to prevent partial snapshots.
