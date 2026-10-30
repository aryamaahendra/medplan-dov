# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-10-30

### Added

- **Rich KPA Selector**: Introduced `KpaSelectField` component rendering DiceBear avatar previews and NIP identifiers across need detail forms and the PDF export dialog.
- **Select Value Formatting**: Added `formatSelectedValue` support to `SelectField` alongside improved text truncation on Base UI select trigger and value primitives.

### Fixed

- **PDF Proposal Signer Resolution**: Proposal export now defaults to the assigned KPA when `signer_id` is omitted, pre-fills the signer in the export dialog from need details, and replaces hardcoded dummy signatures with clean unassigned placeholders.

### Changed

- **CI Workflows**: Temporarily removed GitHub Actions workflow files.

---

## [1.1.0] - 2026-10-27

### Added

- **Unified Need Lifecycle & Approval Flow**: Canonical status lifecycle (`draft`, `submitted`, `under_review`, `approved`, `rejected`), submission controls, and atomic submission endpoints.
- **Executive Review & Director Determinations**: Overhauled executive review dialog, financial comparison views, and director determination workflows with residual rollover.
- **Unapproved Need Rollover Engine**: Automated intake and rollover of unapproved proposals from prior need group cycles into subsequent planning cycles with organizational scoping.
- **Need Locking & Window Scheduling**: Submission window scheduling, per-need lifecycle freezing, temporary extension windows, and administrative lock override controls.
- **Organizational Unit Lifecycle & Trash Management**: Soft-delete, restore, and permanent deletion with typed confirmation, parent-child deletion guards, and orphaned proposal handling.
- **Permission Matrix Editor**: Interactive role-permission matrix editor with batch update endpoints and granular navigation guards.
- **Standardized UI Components**: Reusable money input, standardized form fields showcase, OKLCH semantic tokens, and DiceBear avatar fallbacks.
- **Modernized Dashboards**: Multi-variant needs dashboard (adaptive analytical workspace and operations command center) with stage scoping and telemetry pipeline cards.
- **Architecture Gates**: ArchTest suite enforcing controller/policy finality, DTO decoupling, and feature-based directory conventions (`resources/js/features/`).

### Changed

- Migrated UI primitives from Radix UI to `@base-ui/react` (buttons, dialogs, form controls, toggles, accordions, and separators).
- Standardized iconography from Lucide to Remix Icon (`remixicon`).
- Refactored needs show/edit views into modular section components and form rails.
- Redesigned need groups index from table layout to visual telemetry pipeline cards with multi-year trend charts.

### Fixed

- **Docker & Persistence**: Added volume mounts for Redis persistence and scheduler storage access; raised PostgreSQL `max_locks_per_transaction`.
- **Export Security**: Secured proposal PDF export endpoints against unauthorized access.
- **Revision Deadlock**: Resolved deadlock preventing proposal revisions outside active submission windows.
- **Financial Calculations**: Preserved priority ordering, financial totals integrity, and normalized decimal volume formatting.
- **Dashboard Telemetry**: Corrected SQL aggregations for stage and attention metrics across all records.

---

## [1.0.0] - 2026-10-22

### Added

- **Initial Core Release**: Latsar Planning & Procurement System baseline.
- **Procurement Needs Intake**: Need submission forms with dynamic multi-source funding and Terms of Reference (TOR) specifications.
- **Role-Based Access Control (RBAC)**: Spatie-backed permission system with Director, Planner, and Unit-level roles and policies.
- **Organizational Hierarchy**: Unit scoping, hierarchical unit assignment, and unit-restricted need management.
- **PDF Proposal Export**: Automated PDF generation for submitted need proposals with dynamic signature layouts.
- **Planning Dashboard**: Initial aggregated trend charts, unit stat cards, and cross-group analytics with Inertia deferred props.
- **Production Containerization**: Docker runtime powered by FrankenPHP, Laravel Octane, and PostgreSQL.

### Security

- Patched PHP core vulnerabilities CVE-2026-109618 and CVE-2026-109619 via FrankenPHP base pin `1.13.2-php8.4`.
- Enforced persistent upload volume to prevent data loss across container restarts.
