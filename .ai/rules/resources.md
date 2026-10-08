---
paths:
    - 'resources/**'
---

# Resources

## Standardized Semantic Colors and OKLCH Usage

Standardize all status colors using project OKLCH CSS variables in resources/css/app.css:

- success: primary lime (oklch(0.841 0.238 128.85) in light, oklch(0.768 0.233 130.85) in dark) with dark contrast text foreground (oklch(0.405 0.101 131.063)).
- destructive / danger: shadcn crimson OKLCH tokens.
- warning: amber/gold OKLCH (oklch(0.76 0.16 70) in light, oklch(0.78 0.15 72) in dark) with espresso contrast text foreground.
- info: sapphire blue OKLCH (oklch(0.58 0.15 245) in light, oklch(0.68 0.14 242) in dark).
- muted: neutral gray for inactive/draft states.
  Never use ad-hoc Tailwind color utilities (e.g., text-emerald-_, bg-rose-_, text-blue-_, bg-amber-_, text-red-*).
  Do not modify primitive shadcn components in resources/js/components/ui/ to add custom status colors; instead use dedicated forked components such as @/components/status-badge.
