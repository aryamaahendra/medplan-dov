# navigation-menu

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/navigation-menu.tsx`: Migrated from `radix-ui` NavigationMenu to `@base-ui/react/navigation-menu`.
  - Shifted to positioner model with `NavigationMenuPositioner` (`Portal > Positioner > Popup > Viewport`).
  - Preserved Remixicon `RiArrowDownSLine` chevron icon.
  - Exported `NavigationMenuPositioner as NavigationMenuViewport` for backwards-compatibility.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/navigation-menu.tsx` -> clean (0 matches).

## Left alone

- None.

## Behavior changes

- Navigation menu positioner dynamically tracks trigger size and transitions width/height.

## Verify by hand

- Navigate to header top navigation menu in desktop view.
- Hover navigation items and verify dropdown menu positioner and transitions.
