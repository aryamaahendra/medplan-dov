# sidebar

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/sidebar.tsx`: Migrated from `radix-ui` `Slot` to `@base-ui/react/use-render` and `@base-ui/react/merge-props`.
  - Replaced `asChild` on polymorphic sidebar triggers/buttons with `render` prop.
  - Replaced Remixicon placeholder with `RiSideBarLine`.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/sidebar.tsx` -> clean (0 matches).
- `resources/js/components/app-sidebar.tsx`: Replaced `asChild` on `SidebarMenuButton` with `render` prop.
- `resources/js/components/nav-main.tsx`: Replaced `asChild` on `SidebarMenuButton` with `render` prop.
- `resources/js/components/nav-footer.tsx`: Replaced `asChild` on `SidebarMenuButton` with `render` prop.
- `resources/js/components/nav-user.tsx`: Replaced `asChild` on `DropdownMenuTrigger` wrapping `SidebarMenuButton` with `render` prop.

## Left alone

- None.

## Behavior changes

- None.

## Verify by hand

- Expand and collapse sidebar (both desktop and mobile view).
- Click navigation links in main navigation, footer navigation, and app logo.
- Check active link states and tooltips when collapsed.
