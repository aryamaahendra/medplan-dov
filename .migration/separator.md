# separator

2026-09-21, golden pair via Base UI registry URL (`base-nova`), progressive migration verified clean

## Changed

- `resources/js/components/ui/separator.tsx`: Migrated primitive import from `radix-ui` to `@base-ui/react/separator`.
  - Replaced `SeparatorPrimitive.Root` with callable `SeparatorPrimitive`.
  - Dropped `decorative` prop (`decorative = true` default in Radix; Base UI's separator is always semantic `role="separator"`).
  - Preserved existing className styling and orientation attributes (`data-horizontal`, `data-vertical`).
  - Typed props via `SeparatorPrimitive.Props`.
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui"` returned zero matches).

## Left alone

- All other 23 Radix UI component wrappers in `resources/js/components/ui/` remain on Radix UI pending progressive migration.
- Consumers (`button-group.tsx`, `field.tsx`, `sidebar.tsx`, `layouts/settings/layout.tsx`, `pages/kpi/groups/show.tsx`, `pages/need/needs/components/tujuan-alignment-card.tsx`, `pages/renstra/renstras/show.tsx`) used standard `<Separator />` or `<Separator orientation="vertical" />`, needing no changes.

## Behavior changes

- Radix `decorative` prop was dropped; Base UI Separator always renders `role="separator"` on the root div.
- All visual rendering and orientation behavior remains identical.

## Verify by hand

1. Open a page using separators (e.g. `/settings/appearance` or `/renstras/1`).
2. Verify horizontal separators render with 1px border height and full width.
3. Verify vertical separators (e.g., in headers or button bars) render with 1px width and self-stretch.
