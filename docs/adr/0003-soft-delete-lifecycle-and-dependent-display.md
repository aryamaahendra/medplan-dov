# Soft Delete Lifecycle and Dependent Entity Presentation

## Status

accepted

## Context

When master entities such as `OrganizationalUnit` are soft-deleted, active planning workflows must not expose them for new selections or dropdown filters. However, historical `Need` proposals submitted by that unit must remain accessible for budgeting and auditing. If a related unit is soft-deleted, displaying the deleted unit in summary cards or tables causes confusing broken links, while hard-deleting or cascade-deleting would violate audit trails and trigger dangerous database cascade deletions.

## Decision

1. **Dependent Proposal Preservation & Presentation**:
    - Needs referencing a trashed `OrganizationalUnit` continue to appear in Need overviews and reporting.
    - In overview summaries (Need cards, table rows), the unit badge/hierarchy breadcrumb is suppressed (`null` / omitted).
    - In detail and edit views (`/needs/{id}`), an explicit banner alerts users that the linked unit is inactive, requiring reassignment to an active unit before saving changes.
2. **Filter Exclusions**:
    - Filter dropdowns on planning tables strictly query active records (`whereNull('deleted_at')`), preventing trashed units from appearing as selectable options.
    - A specialized filter option (`Tanpa Unit Aktif` / `Unit Terhapus`) allows planners to deliberately locate orphaned proposals.
3. **Deletion Safeguards & Cascading**:
    - Soft-deleting an `OrganizationalUnit` is rejected if it has active child units (`descendantsRecursive`) or active users, requiring explicit reassignment first.
    - Associated users are prohibited from submitting new proposals under a trashed unit.
4. **Lifecycle & Restoration**:
    - Trashed items are toggled via an inline `Switch` control in the toolbar ("Tampilkan Terhapus" / "Lihat Tempat Sampah") on their management pages, presenting explicit `Restore` and guarded `Force Delete` actions.
    - Restoring a unit immediately re-activates its visibility in filters and restores unit path breadcrumbs across all associated proposals.
