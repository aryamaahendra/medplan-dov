# button

2026-09-21, golden pair via Base UI registry URL (`base-nova`), progressive migration verified clean

## Changed

- `resources/js/components/ui/button.tsx`: Migrated primitive from Radix `Slot` (`asChild`) to `@base-ui/react/button` primitive (`ButtonPrimitive`).
  - Replaced manual `asChild ? Slot.Root : "button"` dispatch with direct `<ButtonPrimitive data-slot="button" className={...} {...props} />`.
  - Replaced props type `React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }` with `ButtonPrimitive.Props & VariantProps<typeof buttonVariants>`.
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` returned zero matches).
- `resources/js/components/ui/alert-dialog.tsx`:
  - `AlertDialogAction` and `AlertDialogCancel` previously wrapped `AlertDialogPrimitive.Action` / `Cancel` inside `<Button asChild>`.
  - Inverted composition so Radix `AlertDialogPrimitive.*` components receive `asChild` wrapping `<Button variant={variant} size={size} />`.
- App-code consumers migrated from `asChild` to `render` or native button semantics:
  - `resources/js/components/delete-user.tsx`: Replaced `<Button asChild><button type="submit">...</button></Button>` with native `<Button type="submit" ...>`.
  - `resources/js/components/file-preview-dialog.tsx`: Converted `<Button asChild><a href={downloadUrl}>...</a></Button>` to `render={<a href={downloadUrl}>...</a>}`.
  - `resources/js/components/pdf-viewer.tsx`: Converted `<Button asChild title="Download PDF"><a ...>...</a></Button>` to `render={<a ...>...</a>}`.
  - `resources/js/layouts/settings/layout.tsx`: Converted `<Button asChild><Link ...>...</Link></Button>` to `render={<Link ...>...</Link>}`.
  - `resources/js/pages/management/roles/index.tsx`: Converted `<Button asChild><Link ...>...</Link></Button>` to `render={<Link ...>...</Link>}`.
  - `resources/js/pages/management/roles/role-form.tsx`: Converted `<Button asChild><Link ...>...</Link></Button>` to `render={<Link ...>...</Link>}`.
  - `resources/js/pages/need/needs/components/attachment-table.tsx`: Converted `<Button asChild><a ...>...</a></Button>` to `render={<a ...>...</a>}`.
  - `resources/js/pages/need/needs/components/need-card.tsx`: Converted `<Button asChild><Link ...>...</Link></Button>` to `render={<Link ...>...</Link>}`.
  - `resources/js/pages/need/needs/components/need-sidebar.tsx`: Converted `<Button asChild><Link ...>...</Link></Button>` to `render={<Link ...>...</Link>}`.
  - `resources/js/pages/planning/activity-versions/index.tsx`: Converted `<Button asChild><a ...>...</a></Button>` and `<Button asChild><Link ...>...</Link></Button>` to `render={<a ...>...</a>}` and `render={<Link ...>...</Link>}`.

## Left alone

- All other 21 Radix UI component wrappers in `resources/js/components/ui/` remain on Radix UI pending progressive migration.
- Radix primitives in overlays (`dialog.tsx`, `dropdown-menu.tsx`, etc.) that still use `asChild` with `Button` as their child work natively with Base UI Button.
- Non-radix wrappers (`sonner`, `input-otp`, etc.) intentionally untouched.

## Behavior changes

- None. Base UI Button renders a native `<button>` element by default, supporting the same props and events, and uses the `render` prop when rendering custom elements (such as `<a>` or Inertia `<Link>`).
- Polymorphic composition on `<Button>` call sites now uses Base UI's standard `render={<Child />}` prop instead of Radix `asChild`.

## Verify by hand

1. Open `/dashboard` or `/roles` and click standard buttons; verify click handlers, focus outlines, and active press transforms feel identical.
2. Click any link button (e.g. "Tambah Role" or "Kembali" in Need sidebar) to verify Inertia `<Link>` navigation works seamlessly through the `render` prop.
3. Open a modal with a form submission button (e.g. Delete Account dialog) to confirm `<Button type="submit">` triggers the submit action properly.
4. Verify external download links (e.g. PDF viewer download or Need attachment download) download correctly.
