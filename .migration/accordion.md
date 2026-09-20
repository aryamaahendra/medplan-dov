# accordion

2026-09-21, golden pair via Base UI registry URL (`base-nova`), progressive migration verified clean

## Changed

- `resources/js/components/ui/accordion.tsx`: Migrated primitive import from `radix-ui` to `@base-ui/react/accordion`.
  - Replaced Radix `AccordionPrimitive.Root`, `Item`, `Header`, `Trigger`, `Content` with Base UI primitives (`Root`, `Item`, `Header`, `Trigger`, `Panel`).
  - Switched trigger disabled styling from `disabled:*` to `aria-disabled:*`.
  - Replaced height CSS variable `--radix-accordion-content-height` with Base UI `--accordion-panel-height` and added starting/ending style hooks `data-ending-style:h-0 data-starting-style:h-0`.
  - Replaced prop types with `AccordionPrimitive.*.Props`.
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` returned zero matches).
- `package.json` & `package-lock.json`: Added `@base-ui/react` dependency.

## Left alone

- All other 24 Radix UI component wrappers in `resources/js/components/ui/` remain on Radix UI pending progressive migration.
- Non-radix wrappers (`sonner`, `input-otp`, etc.) intentionally untouched.

## Behavior changes

- Base UI accordion panels use `multiple` boolean instead of `type="single" | "multiple"`.
- Base UI value model for controlled accordions uses arrays (`string[]`) instead of string in single mode.
- Roving focus arrow keys are dropped in Base UI per APG guidance updates.
- No existing app consumers currently import `Accordion`, so zero call-sites were affected.

## Verify by hand

1. Render a test Accordion with multiple items.
2. Click triggers to expand and collapse panels; verify CSS animations play smoothly.
3. Test keyboard focus (Tab navigation between triggers, Enter/Space to toggle).
4. Verify disabled item state prevents interaction.
