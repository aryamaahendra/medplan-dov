# breadcrumb

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/breadcrumb.tsx`: Migrated from `radix-ui` `Slot` to `@base-ui/react/use-render` and `@base-ui/react/merge-props`.
  - Replaced `asChild` on `BreadcrumbLink` with `render` prop.
  - Retained Remixicon icons (`RiArrowRightSLine`, `RiMoreLine`).
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/breadcrumb.tsx` -> clean (0 matches).
- `resources/js/components/breadcrumbs.tsx`: Updated call site from `<BreadcrumbLink asChild>` to `<BreadcrumbLink render={<Link href={item.href} />}>`.

## Left alone

- None.

## Behavior changes

- None.

## Verify by hand

- Click breadcrumbs links in header; verify navigation works with Inertia `<Link>`.
