# dialog

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/dialog.tsx`: Migrated from `radix-ui` Dialog to `@base-ui/react/dialog`.
  - Replaced `DialogOverlay` with `DialogPrimitive.Backdrop`.
  - Replaced `DialogContent` with `DialogPrimitive.Popup`.
  - Replaced `DialogClose` with `DialogPrimitive.Close`.
  - Replaced Remixicon placeholder with `RiCloseLine`.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/dialog.tsx` -> clean (0 matches).
- `resources/js/components/delete-user.tsx`: Replaced `asChild` on `DialogTrigger` and `DialogClose` with `render` prop.
- `resources/js/components/ui/tree-select.tsx`: Replaced `asChild` on `DialogTrigger` with `render` prop.
- `resources/js/pages/need/groups/checklists/components/question-bank-dialog.tsx`: Replaced `asChild` on `DialogTrigger` with `render` prop.
- `resources/js/pages/need/needs/components/export-pdf-dialog.tsx`: Replaced `asChild` on `DialogTrigger` with `render` prop.
- `resources/js/pages/planning/activity-versions/import-dialog.tsx`: Replaced `asChild` on `DialogTrigger` with `render` prop.

## Left alone

- None.

## Behavior changes

- Modal backdrop and popup use Base UI dialog state machine with transition/animation classes.

## Verify by hand

- Trigger modals across the app: "Delete account" in settings, "Tambah dari Bank", "Ekspor PDF", "Import Data Aktivitas", and "TreeSelect".
- Verify open/close behavior, focus trapping, ESC to close, backdrop click to close, and close button click.
