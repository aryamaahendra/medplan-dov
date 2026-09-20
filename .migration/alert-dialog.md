# alert-dialog

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/alert-dialog.tsx`: Migrated from `radix-ui` AlertDialog to `@base-ui/react/alert-dialog`.
  - Replaced `AlertDialogOverlay` with `AlertDialogPrimitive.Backdrop`.
  - Replaced `AlertDialogContent` with `AlertDialogPrimitive.Popup`.
  - Replaced `AlertDialogCancel` with `AlertDialogPrimitive.Close` wrapping `Button`.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/alert-dialog.tsx` -> clean (0 matches).

## Left alone

- None.

## Behavior changes

- None.

## Verify by hand

- Trigger any confirmation alert dialog (e.g. destructive action prompts).
- Confirm alert dialog opens, focus is constrained, and clicking Cancel or Action operates as expected.
