# badge

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/badge.tsx`: Migrated from `radix-ui` `Slot` to `@base-ui/react/use-render` and `@base-ui/react/merge-props`.
  - Replaced `asChild` with polymorphic `render` prop.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/badge.tsx` -> clean (0 matches).

## Left alone

- None.

## Behavior changes

- None.

## Verify by hand

- Inspect status badges across data tables and detail views. Confirm variant styling and colors render correctly.
