# dropdown-menu

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/dropdown-menu.tsx`: Migrated from `radix-ui` DropdownMenu to `@base-ui/react/menu`.
  - Shifted to positioner model: `Portal > Positioner > Popup`.
  - Replaced Remixicon placeholders with `RiCheckLine` and `RiArrowRightSLine`.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/dropdown-menu.tsx` -> clean (0 matches).
- `resources/js/components/action-dropdown.tsx`: Replaced `asChild` on `DropdownMenuTrigger` and `DropdownMenuItem` with `render` prop.
- `resources/js/components/app-header.tsx`: Replaced `asChild` on user avatar `DropdownMenuTrigger` with `render` prop.
- `resources/js/components/data-table/data-table-column-header.tsx`: Replaced `asChild` on `DropdownMenuTrigger` with `render` prop and `data-[state=open]` with `data-open`.
- `resources/js/components/data-table/data-table-faceted-filter.tsx`: Replaced `asChild` on `DropdownMenuTrigger` with `render` prop.
- `resources/js/components/kpis/indicator-table.tsx`: Replaced `asChild` on `DropdownMenuTrigger` with `render` prop.
- `resources/js/components/nav-user.tsx`: Replaced `asChild` on `DropdownMenuTrigger` with `render` prop and `w-(--radix-dropdown-menu-trigger-width)` with `w-(--anchor-width)`.
- `resources/js/components/user-menu-content.tsx`: Replaced `asChild` on `DropdownMenuItem` with `render` prop.
- `resources/js/pages/renstra/renstras/components/tujuan-card.tsx`: Replaced `asChild` on `DropdownMenuTrigger` with `render` prop.

## Left alone

- None.

## Behavior changes

- Dropdown menus use Base UI Menu positioner with anchor width alignment (`--anchor-width`), sub-menu cascading, and smooth entry/exit animations.

## Verify by hand

- Click user menu in header and sidebar.
- Click action dropdowns in data tables.
- Click column header sort dropdowns and faceted filters.
- Verify opening, keyboard navigation (arrows, Enter, Escape), link navigation, and submenus.
