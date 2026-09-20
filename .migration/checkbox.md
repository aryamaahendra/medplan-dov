# checkbox

2026-09-21, golden pair via Base UI registry URL (`base-nova`), progressive migration verified clean

## Changed

- `resources/js/components/ui/checkbox.tsx`: Migrated primitive import from `radix-ui` to `@base-ui/react/checkbox`.
  - Replaced Radix `CheckboxPrimitive.Root` with `@base-ui/react/checkbox` `CheckboxPrimitive.Root`.
  - Replaced Radix `CheckboxPrimitive.Indicator` with `@base-ui/react/checkbox` `CheckboxPrimitive.Indicator`.
  - Retained RemixIcon `RiCheckLine` matching project convention.
  - Replaced prop type `React.ComponentProps<typeof CheckboxPrimitive.Root>` with `CheckboxPrimitive.Root.Props`.
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` returned zero matches).

## Left alone

- Non-radix wrappers and other unmigrated components remain untouched.
- `dropdown-menu.tsx` has `DropdownMenuCheckboxItem` which belongs to `dropdown-menu` and will migrate with that family.
- Call sites in `login.tsx`, alignment sections (`ikk-alignment-section.tsx`, `planning-alignment-section.tsx`, `renstra-alignment-section.tsx`, `rls-alignment-section.tsx`) pass standard `checked`, `onCheckedChange` (boolean), `id`, `name`, `disabled`, which match `@base-ui/react/checkbox` natively.

## Behavior changes

- Radix `checked="indeterminate"` is split into separate `indeterminate` boolean prop in Base UI. None of the project call sites used indeterminate state.
- In Base UI, `onCheckedChange` passes `(checked: boolean, eventDetails: Checkbox.Root.ChangeEventDetails)`. Existing handlers using `(checked) => ...` remain fully type-safe and behave identically.

## Verify by hand

1. Navigate to `/login` and toggle the "Remember me" checkbox; verify check icon renders and outline focus shows properly.
2. Open a form with multi-checkbox selection (e.g. Planning Alignment or IKK Alignment in Need form) and toggle items; verify state updates immediately.
3. Tab through checkboxes with keyboard and toggle using Spacebar.
