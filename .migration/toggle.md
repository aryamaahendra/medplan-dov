# toggle

2026-09-21, golden pair via Base UI registry URL (`base-nova`), progressive migration verified clean

## Changed

- `resources/js/components/ui/toggle.tsx`: Migrated primitive import from `radix-ui` to `@base-ui/react/toggle`.
  - Replaced Radix `TogglePrimitive.Root` with callable `@base-ui/react/toggle` `TogglePrimitive`.
  - Replaced prop type `React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>` with `TogglePrimitive.Props & VariantProps<typeof toggleVariants>`.
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` returned zero matches).

## Left alone

- All other 17 Radix UI component wrappers in `resources/js/components/ui/` remain on Radix UI pending progressive migration.
- `toggle-group.tsx` imports `toggleVariants` from `toggle.tsx`, which continues to export identically.

## Behavior changes

- In Base UI, single-part components like Toggle are callable root primitives rather than namespace `.Root` components.
- `defaultPressed` / `pressed` / `onPressedChange` continue to be supported natively.

## Verify by hand

1. Render `<Toggle>` with default or outline variant.
2. Click to toggle pressed state; verify background shifts to muted when pressed.
3. Test keyboard focus (Tab and Space/Enter).
