# sheet

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/sheet.tsx`: Migrated from `radix-ui` Dialog (`SheetPrimitive`) to `@base-ui/react/dialog`.
  - Replaced `SheetOverlay` with `SheetPrimitive.Backdrop`.
  - Replaced `SheetContent` with `SheetPrimitive.Popup`.
  - Replaced `SheetClose` with `SheetPrimitive.Close`.
  - Replaced Remixicon placeholder with `RiCloseLine`.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/sheet.tsx` -> clean (0 matches).
- `resources/js/components/app-header.tsx`: Replaced `asChild` on `SheetTrigger` with `render` prop.

## Left alone

- None.

## Behavior changes

- Side drawer animations use Base UI transition and starting/ending styles.

## Verify by hand

- On mobile view / resized browser, click mobile menu toggle in header.
- Verify sheet slides in from the left, backdrop blurs, and closing works via click-outside, ESC, or close button.
