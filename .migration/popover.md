# popover

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/popover.tsx`: Migrated from `radix-ui` Popover to `@base-ui/react/popover`.
  - Shifted to positioner model: `Portal > Positioner > Popup`.
  - Exported `PopoverAnchor` fallback component.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/popover.tsx` -> clean (0 matches).
- `resources/js/pages/need/needs/components/funding-section.tsx`: Replaced `asChild` on `PopoverTrigger` with `render` prop, and changed `w-[--radix-popover-trigger-width]` to `w-(--anchor-width)`.

## Left alone

- None.

## Behavior changes

- Popover positions using Base UI positioner engine and `--anchor-width` custom property for trigger-width matching.

## Verify by hand

- Open funding section in needs form (`funding-section.tsx`). Click "Pilih sumber dana...", verify popover opens aligned to trigger width, and search/selection functions properly.
