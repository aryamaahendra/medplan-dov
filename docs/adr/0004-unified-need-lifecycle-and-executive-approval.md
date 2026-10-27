# Unified Need Lifecycle and Executive Approval

## Status

accepted

## Context

Previously, procurement proposals (`Need`) maintained two divergent and confusing status layers: a database proposal status (`status`: `draft`, `approved` [displayed in Indonesian UI as "Diajukan"], `rejected`) and a derived executive status calculated from timestamps and review notes (`approved_by_director_at` and `notes`). Admins could arbitrarily edit status via form inputs without workflow checks, and Director approval could not record negotiated downward volume adjustments or forward unapproved residual quantities into future planning cycles.

## Decision

1. **Unified Status Lifecycle**: Consolidate proposal and executive evaluation into a single canonical `needs.status` enum: `draft` -> `submitted` -> `approved` | `rejected` | `revision`.
    - Creation defaults to `draft`.
    - Submitting transitions to `submitted` and engages read-only locking for submitting units.
    - Director evaluation branches into:
        - `approved`: Director approves proposal with explicit `approved_volume`, `approved_unit_price`, and `approved_total_price`.
        - `rejected`: Proposal rejected, with optional next-cycle rollover recommendation.
        - `revision`: Proposal unlocked for submitters to amend and resubmit (`revision` -> `submitted`).
2. **Executive Adjustments & Residual Recommendation**: Add `approved_volume`, `approved_unit_price`, `approved_total_price`, `is_recommended_for_next_cycle`, and `recommended_volume`. When approved with partial volume (`approved_volume < volume`), the unapproved residual volume (`volume - approved_volume`) can be formally designated for priority rollover into subsequent `NeedGroup` cycles.
3. **Consolidated Domain Badge**: Retire duplicate parallel badges in favor of a single `NeedStatusBadge` reflecting the unified lifecycle state.
4. **Zero-Downtime Production Migration**: Historical data migration maps unreviewed `status = 'approved'` records to `submitted`, unapproved records with review notes to `revision`, and backfills `approved_*` columns from original figures for historically approved records.
