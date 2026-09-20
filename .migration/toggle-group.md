# toggle-group

2026-09-21, golden pair via Base UI registry URL (`base-nova`), progressive migration verified clean

## Changed

- `resources/js/components/ui/toggle-group.tsx`: Migrated primitive imports from `radix-ui` to `@base-ui/react/toggle-group` and `@base-ui/react/toggle`.
  - Replaced Radix `ToggleGroupPrimitive.Root` with callable `@base-ui/react/toggle-group` `ToggleGroupPrimitive`.
  - Replaced Radix `ToggleGroupPrimitive.Item` with `@base-ui/react/toggle` `TogglePrimitive`.
  - Replaced prop types with `ToggleGroupPrimitive.Props` and `TogglePrimitive.Props`.
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` returned zero matches).
- App consumers updated per `consumer-props.md`:
  - `resources/js/pages/need/needs/components/general-info-section.tsx`: Dropped `type="single"`, wrapped `value` as `data.unit ? [data.unit] : []`, and adapted `onValueChange` handler to array-based value.
  - `resources/js/pages/renstra/renstras/show.tsx`: Dropped `type="single"`, wrapped `value` as `[view]`, and adapted `onValueChange` handler to array-based value.

## Left alone

- All other 16 Radix UI component wrappers in `resources/js/components/ui/` remain on Radix UI pending progressive migration.

## Behavior changes

- In Base UI, `type="single" | "multiple"` is replaced by the `multiple?: boolean` prop (default `false`).
- Controlled `value` and `defaultValue` are always arrays of strings (`readonly string[]`), and `onValueChange` fires with `(groupValue: string[], eventDetails)`.
- Roving focus arrow keys loop through items via `loopFocus` (defaults `true`).

## Verify by hand

1. Navigate to `/renstras/1` and toggle between "Card" and "Table" views; verify view flips cleanly and active item receives selected style.
2. Navigate to `/needs/create` and toggle "Satuan & Volume" units (`UNIT_OPTIONS`); verify active item updates and unit state is stored.
3. Test keyboard arrow keys between group items.
