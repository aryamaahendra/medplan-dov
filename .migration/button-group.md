# button-group

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/button-group.tsx`: Migrated from `radix-ui` `Slot` to `@base-ui/react/use-render` and `@base-ui/react/merge-props`.
  - Replaced `asChild` on `ButtonGroupText` with `render` prop.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/button-group.tsx` -> clean (0 matches).

## Left alone

- None.

## Behavior changes

- None.

## Verify by hand

- Navigate to `needs-table-toolbar.tsx` views; check button groups layout and borders between buttons.
