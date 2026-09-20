# avatar

2026-09-21, golden pair via registry fetch, clean migration to @base-ui/react

## Changed

- `resources/js/components/ui/avatar.tsx`: Migrated from `radix-ui` Avatar to `@base-ui/react/avatar`.
  - Updated props to `AvatarPrimitive.Root.Props`, `AvatarPrimitive.Image.Props`, and `AvatarPrimitive.Fallback.Props`.
  - Leftover scan: `grep -n "radix-ui\|@radix-ui" resources/js/components/ui/avatar.tsx` -> clean (0 matches).

## Left alone

- None.

## Behavior changes

- None.

## Verify by hand

- Navigate to dashboard or header showing user avatar (`app-header.tsx`, `user-info.tsx`).
- Verify avatar image renders, fallback initials render on image error/missing.
