# scroll-area

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/scroll-area.tsx`: Migrated from `radix-ui` ScrollArea to `@base-ui/react/scroll-area`.
  - Replaced `ScrollAreaScrollbar` with `ScrollAreaPrimitive.Scrollbar`.
  - Replaced `ScrollAreaThumb` with `ScrollAreaPrimitive.Thumb`.
  - Updated props to `ScrollAreaPrimitive.Root.Props` and `ScrollAreaPrimitive.Scrollbar.Props`.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/scroll-area.tsx` -> clean (0 matches).

## Left alone

- None.

## Behavior changes

- None.

## Verify by hand

- Open areas with scrollable content (e.g. `tree-select.tsx` dropdown or funding section in needs).
- Check that scrollbars appear on hover/scroll and scroll thumb drags properly.
