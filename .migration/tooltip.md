# tooltip

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/tooltip.tsx`: Migrated from `radix-ui` Tooltip to `@base-ui/react/tooltip`.
  - Shifted to positioner model: `Portal > Positioner > Popup`.
  - Added `TooltipPrimitive.Arrow`.
  - Renamed `TooltipProvider` prop: `delayDuration` -> `delay`.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/tooltip.tsx` -> clean (0 matches).
- `resources/js/app.tsx`: Updated `<TooltipProvider delayDuration={0}>` to `<TooltipProvider delay={0}>`.
- `resources/js/components/ui/sidebar.tsx`: Updated `<TooltipTrigger asChild>{button}</TooltipTrigger>` to `<TooltipTrigger render={button} />`.

## Left alone

- None.

## Behavior changes

- Tooltip uses Base UI positioner and CSS animations with `--transform-origin`.

## Verify by hand

- Hover over sidebar buttons in collapsed mode or buttons with tooltips. Check open delay, arrow positioning, and dismiss on unhover/escape.
