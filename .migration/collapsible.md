# collapsible

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/collapsible.tsx`: Migrated from `radix-ui` Collapsible to `@base-ui/react/collapsible`.
  - Replaced `CollapsiblePrimitive.CollapsibleContent` with `CollapsiblePrimitive.Panel`.
  - Updated props to `CollapsiblePrimitive.Root.Props`, `CollapsiblePrimitive.Trigger.Props`, and `CollapsiblePrimitive.Panel.Props`.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/collapsible.tsx` -> clean (0 matches).

## Left alone

- None.

## Behavior changes

- Base UI Collapsible panel animates smoothly using height transitions and data-open/data-closed attributes.

## Verify by hand

- Click collapsible triggers; check expand/collapse animations and aria-expanded state.
