# Project Migration: Radix UI -> Base UI

2026-09-21, Whole-project batch migration completed

## Summary

All components previously on Radix UI / `radix-ui` were migrated to `@base-ui/react` alongside their call-site consumers.

### Batches Executed:
1. **Batch 1: Standalone & Simple Elements**
   - `avatar.tsx` -> `@base-ui/react/avatar`
   - `collapsible.tsx` -> `@base-ui/react/collapsible`
   - `scroll-area.tsx` -> `@base-ui/react/scroll-area`
   - `badge.tsx` -> `@base-ui/react/use-render` + `merge-props`
   - `breadcrumb.tsx` -> `@base-ui/react/use-render` + `merge-props`
   - `button-group.tsx` -> `@base-ui/react/use-render` + `merge-props`
2. **Batch 2: Tooltip, Tabs & Navigation**
   - `tooltip.tsx` -> `@base-ui/react/tooltip`
   - `tabs.tsx` -> `@base-ui/react/tabs`
   - `navigation-menu.tsx` -> `@base-ui/react/navigation-menu`
3. **Batch 3: Dialogs & Overlays**
   - `dialog.tsx` -> `@base-ui/react/dialog`
   - `alert-dialog.tsx` -> `@base-ui/react/alert-dialog`
   - `sheet.tsx` -> `@base-ui/react/dialog`
4. **Batch 4: Menus, Complex Components & Finalize**
   - `popover.tsx` -> `@base-ui/react/popover`
   - `dropdown-menu.tsx` -> `@base-ui/react/menu`
   - `sidebar.tsx` -> `@base-ui/react/use-render` + `merge-props`

### Dependency & Config Changes:
- `components.json`: style switched from `radix-nova` to `base-nova`.
- `package.json`: removed all `@radix-ui/*` individual packages and `radix-ui` unified package; `@base-ui/react` installed.

### Consumer Sweeps:
- Updated `asChild` to `render` across app components (`breadcrumbs.tsx`, `app-header.tsx`, `delete-user.tsx`, `tree-select.tsx`, `question-bank-dialog.tsx`, `export-pdf-dialog.tsx`, `import-dialog.tsx`, `funding-section.tsx`, `action-dropdown.tsx`, `app-sidebar.tsx`, `data-table-column-header.tsx`, `data-table-faceted-filter.tsx`, `indicator-table.tsx`, `nav-footer.tsx`, `nav-main.tsx`, `nav-user.tsx`, `user-menu-content.tsx`, `tujuan-card.tsx`).
- Updated `TabsContent` `forceMount` to `keepMounted` and `data-[state=inactive]` to `data-hidden` in `need-form.tsx`.
- Updated Radix CSS custom variables: `--radix-dropdown-menu-trigger-width` / `--radix-popover-trigger-width` to `--anchor-width`.
- Replaced `data-[state=open]` with `data-open` on dropdown and sort triggers.

## Remaining Radix Wrappers:
0 wrappers remain on Radix.
