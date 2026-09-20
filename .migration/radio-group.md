# radio-group

2026-09-21, golden pair via Base UI registry URL (`base-nova`), progressive migration verified clean

## Changed

- `resources/js/components/ui/radio-group.tsx`: Migrated primitive imports from `radix-ui` to `@base-ui/react/radio` and `@base-ui/react/radio-group`.
  - Replaced Radix `RadioGroupPrimitive.Root` with callable `@base-ui/react/radio-group` (`RadioGroupPrimitive`).
  - Replaced Radix `RadioGroupPrimitive.Item` and `RadioGroupPrimitive.Indicator` with `@base-ui/react/radio` (`RadioPrimitive.Root` and `RadioPrimitive.Indicator`).
  - Replaced prop types: `RadioGroupPrimitive.Props` for `RadioGroup` and `RadioPrimitive.Root.Props` for `RadioGroupItem`.
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` returned zero matches).

## Left alone

- All other 19 Radix UI component wrappers in `resources/js/components/ui/` remain on Radix UI pending progressive migration.
- `dropdown-menu.tsx` has `DropdownMenuRadioGroup` which belongs to `dropdown-menu` and will migrate with that family.
- Call sites in `priority-status-section.tsx`, `checklist-item.tsx`, and `response-option.tsx` pass standard `value`, `onValueChange`, `id`, `disabled`, and render without modification.

## Behavior changes

- In Base UI, RadioGroup arrow key navigation automatically wraps and handles bidirectional layout without requiring `loop` or `orientation`.
- `RadioPrimitive.Root` renders a `<span>` element with an internal hidden `<input>` for native form submission.
- `onValueChange` passes `(value: Value, eventDetails: RadioGroup.ChangeEventDetails)`. Existing single-argument callbacks continue to work without modification.

## Verify by hand

1. Navigate to a Need creation or edit page containing `priority-status-section` (e.g. `/needs/create` or `/needs/1/edit`).
2. Select different options for "Status Usulan", "Tingkat Urgensi", and "Tingkat Dampak".
3. Verify that keyboard arrow keys cycle between radio items and Spacebar selects the active item.
4. Verify custom indicator circle renders centered inside the selected radio item.
