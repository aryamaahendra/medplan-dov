# switch

2026-09-21, golden pair via Base UI registry URL (`base-nova`), progressive migration verified clean

## Changed

- `resources/js/components/ui/switch.tsx`: Migrated primitive import from `radix-ui` to `@base-ui/react/switch`.
  - Replaced Radix `SwitchPrimitive.Root` with `@base-ui/react/switch` `SwitchPrimitive.Root`.
  - Replaced Radix `SwitchPrimitive.Thumb` with `@base-ui/react/switch` `SwitchPrimitive.Thumb`.
  - Replaced prop type `React.ComponentProps<typeof SwitchPrimitive.Root> & { size?: "sm" | "default" }` with `SwitchPrimitive.Root.Props & { size?: "sm" | "default" }`.
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` returned zero matches).

## Left alone

- All other 18 Radix UI component wrappers in `resources/js/components/ui/` remain on Radix UI pending progressive migration.
- App call sites in `kpi-group-dialog.tsx`, `kpi-indicator-dialog.tsx`, `role-form.tsx`, `checklist-question-dialog.tsx`, `need-group-dialog.tsx`, `sortable-item.tsx`, `need-director-review-dialog.tsx`, `need-type-dialog.tsx`, and `renstra-dialog.tsx` pass standard `checked`, `defaultChecked`, `onCheckedChange`, `id`, `disabled` and work without change.

## Behavior changes

- `SwitchPrimitive.Root` in Base UI renders a `<span>` with an internal hidden `<input>` for form integration.
- `onCheckedChange` passes `(checked: boolean, eventDetails: Switch.Root.ChangeEventDetails)`. Existing handlers expecting `(checked: boolean) => void` remain fully compatible.

## Verify by hand

1. Open any dialog with a switch toggle (e.g. create/edit role at `/roles`, or create/edit renstra/kpi).
2. Click switch to toggle state; verify thumb transition animation smoothly translates right when checked and returns when unchecked.
3. Test keyboard focus (Tab navigation and Space/Enter to toggle).
