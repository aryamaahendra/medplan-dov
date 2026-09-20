# label

2026-09-21, golden pair via Base UI registry URL (`base-nova`), progressive migration verified clean

## Changed

- `resources/js/components/ui/label.tsx`: Migrated primitive import from `radix-ui` to native `<label>` primitive.
  - In Base UI and shadcn base registry, `Label` renders a native `<label>` tag with `React.ComponentProps<"label">`.
  - Preserved identical styling, data-slot, and disabled selector classes (`flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50`).
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui"` returned zero matches).

## Left alone

- All other 22 Radix UI component wrappers in `resources/js/components/ui/` remain on Radix UI pending progressive migration.
- Consumers across the project (`field.tsx`, form dialogs, input groups, settings pages) pass standard `htmlFor`, `children`, and `className`, which are natively supported on `<label>`.

## Behavior changes

- None. Base UI / shadcn base registry replaces Radix Label with standard `<label>` element.
- No `asChild` was used at call-sites across the project.

## Verify by hand

1. Open any form with input labels (e.g. `/profile` or any create/edit dialog).
2. Click on a label text and verify the associated input receives focus via `htmlFor`/`id`.
3. Check disabled state styles on labels when associated input/group is disabled.
