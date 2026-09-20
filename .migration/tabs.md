# tabs

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/tabs.tsx`: Migrated from `radix-ui` Tabs to `@base-ui/react/tabs`.
  - Replaced `Trigger` with `TabsPrimitive.Tab` and `Content` with `TabsPrimitive.Panel`.
  - Updated props to `TabsPrimitive.Root.Props`, `TabsPrimitive.List.Props`, `TabsPrimitive.Tab.Props`, and `TabsPrimitive.Panel.Props`.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/tabs.tsx` -> clean (0 matches).
- `resources/js/pages/need/needs/components/need-form.tsx`: Updated `forceMount` to `keepMounted` and `data-[state=inactive]:hidden` to `data-hidden:hidden`.

## Left alone

- None.

## Behavior changes

- Tab activation mode defaults to manual (activation on click/Enter) per Base UI 1.x APG alignment.

## Verify by hand

- Navigate to need edit/show tabs (`/needs/:id`).
- Switch tabs with click and keyboard (arrow keys + Enter). Confirm tab content swaps cleanly and form preserves hidden tab values.
