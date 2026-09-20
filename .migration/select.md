# select

2026-09-21, golden pair via Base UI registry URL (`base-nova`), progressive migration verified clean

## Changed

- `resources/js/components/ui/select.tsx`: Migrated primitive imports from `radix-ui` to `@base-ui/react/select`.
  - Replaced Radix `SelectPrimitive.Root` with `@base-ui/react/select` `SelectPrimitive.Root`.
  - Replaced `SelectPrimitive.Content` and `SelectPrimitive.Viewport` with `SelectPrimitive.Portal > SelectPrimitive.Positioner > SelectPrimitive.Popup > SelectPrimitive.List`.
  - Replaced `position="popper" | "item-aligned"` with `alignItemWithTrigger` boolean (default `true`) on Positioner.
  - Positioner forward rule applied: destructured `align`, `alignOffset`, `side`, `sideOffset`, `alignItemWithTrigger` and passed directly to `SelectPrimitive.Positioner`.
  - Replaced CSS custom properties: `--radix-select-trigger-width` -> `--anchor-width`, `--radix-select-content-available-height` -> `--available-height`, `--radix-select-content-transform-origin` -> `--transform-origin`.
  - Replaced `SelectPrimitive.Label` with `SelectPrimitive.GroupLabel`.
  - Replaced `SelectScrollUpButton` / `SelectScrollDownButton` with `SelectPrimitive.ScrollUpArrow` / `SelectPrimitive.ScrollDownArrow`.
  - Replaced `SelectPrimitive.Icon` and `SelectPrimitive.ItemIndicator` `asChild` with `render`.
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` returned zero matches).
- App consumers updated per `consumer-props.md`:
  - `resources/js/pages/need/needs/components/export-pdf-dialog.tsx`: Handled `(value: string | null)` signature for `signer_id` and `paper_size` setters.
  - `resources/js/pages/planning/activity-versions/form.tsx`: Updated `handleParentChange` and `type` setters to handle `string | null`.

## Left alone

- All other 15 Radix UI component wrappers in `resources/js/components/ui/` remain on Radix UI pending progressive migration.
- `tree-select.tsx` uses custom dialog/popover list mechanics, not the standard Select wrapper.
- Standard call sites across the application (`data-table-pagination.tsx`, `organizational-unit-dialog.tsx`, `general-info-section.tsx`, `need-detail-section.tsx`) pass standard props (`value`, `onValueChange`, `placeholder`) and operate seamlessly.

## Behavior changes

- In Base UI, `Select.Value` renders the selected value string. When items are passed as children, `ItemText` sets the label.
- `onValueChange` passes `(value: Value | null, eventDetails: Select.Root.ChangeEventDetails)`. Callbacks expecting `string` must account for `null` when a select is cleared.
- `SelectPrimitive.Positioner` handles positioning outside the popup element, improving subpixel rendering and collision detection.

## Verify by hand

1. Open any form with dropdown selects (e.g. Need create/edit `/needs/create`, or PDF Export dialog).
2. Click trigger to open popup; verify positioner aligns with trigger, animations transition smoothly, and scroll buttons appear if list exceeds max height.
3. Select an item; verify value updates, indicator check icon renders on the selected item, and keyboard navigation (Arrow Up/Down, Enter) works properly.
