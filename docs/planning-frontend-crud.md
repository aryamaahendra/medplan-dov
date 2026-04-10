# Frontend Planning - Planning Versioning CRUD

This document outlines the frontend implementation for the planning versioning system using React and Inertia.js.

## Component Overview

The frontend is divided into two main areas:
1. **Planning Version Management**: List, create, and manage the lifecycle of planning versions.
2. **Planning Activity Version Table**: A hierarchical data table to view and edit activity snapshots for a specific version.

---

## 1. Planning Version Management

**Route**: `/planning-versions`
**React Component**: `resources/js/pages/planning-versions/index.tsx`

### Key Features
- **Data Table**: List all `PlanningVersion` records.
- **Create Initial Version**: Modal/Dialog to start a new fiscal year's planning.
- **Create Revision**: A button on each row to trigger `planning-versions.create-revision`.
- **Set Current**: Toggle `is_current` status via `planning-versions.set-current`.
- **Status Badges**: Visual indicators for `draft`, `submitted`, `approved`, and `archived`.

---

## 2. Planning Activity Version Table

**Route**: `/planning-versions/{version}/activities`
**React Component**: `resources/js/pages/planning-activity-versions/index.tsx`

### Table Implementation (Following `/implement-table` workflow)

#### Columns (`columns.tsx`)
- **Code**: Parent-child nested display.
- **Name**: Activity name.
- **Targets/Budgets**: Dynamic columns for each year defined in the version.
- **Actions**: Edit targets, view details.

#### Features
- **Hierarchical Rendering**: Support for programs -> activities -> sub-activities -> outputs.
- **Inline Editing**: Quick update for yearly targets/budgets using the `update-yearly-data` route.
- **Wayfinder Integration**: Use typed routes from `@/routes` (e.g., `route('planning-versions.activities.index', { planning_version: version.id })`).

---

## 3. Aesthetics & Patterns

- **Dialogs**: Utilize the [create-dialog-form](file:///home/meeatwork/Workspace/client/faraa-latsarapp-laravel-react/.agents/workflows/create-dialog-form.md) pattern.
- **Rich UI**: Modern aesthetics with Tailwind CSS v4, smooth transitions, and responsive layout.
- **Optimistic Updates**: Use Inertia's `router.optimistic()` for immediate feedback when updating yearly data.
