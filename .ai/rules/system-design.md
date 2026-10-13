---
paths:
    - 'resources/**'
---

# Design System & Component Rules

## Shadcn Primitives & Component Integrity

- **`ui/` is Read-Only**: Never edit, add, or delete files in `resources/js/components/ui/` (no variant additions, style edits, or changed defaults) to keep shadcn CLI updates clean.
- **Fork Components & Contract**: App-level forks live in `resources/js/components/` (e.g. `@/components/status-badge`, or `resources/js/components/app/`). Name by purpose (`StatusBadge`, `PageCard`, `DataTableCard`). Every fork **must** accept `className` and `...props` and forward them through `cn()` onto the root primitive so layout classes work. Use a fork when: (a) the same override recurs in 2+ places, (b) a new semantic variant is needed, or (c) default size/variant differs app-wide. Call sites must import the fork, not the raw primitive.
- **Decision Test Before Adding `className` to Primitives**:
    1. Would it look different without this class? If no, don't add it.
    2. Is there a prop or variant for it (`variant`, `size`, `data-icon`)? Use that.
    3. Is it an allowed layout or text utility? Allowed.
    4. Otherwise, it is a new look: create or extend a fork. Never override at call sites.
- **Specific Bans**:
    - **Any `Card*` Slot**: No `p-*`, `px-*`, `py-*`, `gap-*`, or `space-*`. Rely on built-in spacing and `size` prop. Exception: `p-0` or `px-0` on `CardContent` for flush content (tables, charts).
    - **Sizing**: No `h-*`, `min-h-*`, or font size classes on `Button`, `Badge`, `Input`, `SelectTrigger`, `Tabs`, `Switch`. Check the component's `size` prop in `resources/js/components/ui/` for available options. If a size is missing, make a fork.
    - **Icons inside `Button` / `Badge`**: No `size-*`, `h-* w-*`, `mr-*`, or `ml-*`. Use `data-icon="inline-start"` or `data-icon="inline-end"`. Primitives auto-size child SVGs via CSS.
    - **Typography & Shape**: No overriding font family, font size, weight, line height, or border radius on primitives.
    - **Palette Colors**: Never use raw Tailwind palette colors (`slate-*`, `emerald-*`, `red-*`, `amber-*`, `blue-*`, etc.) or arbitrary hex (`bg-[#...]`).
- **Allowed Utilities at Call Sites**:
    - **Layout**: Margins (`mt-4`), flex/grid child alignment (`flex-1`, `self-*`, `col-span-*`, `order-*`), container width (`w-full`, `max-w-*`), and responsive visibility (`hidden md:block`).
    - **Text Utilities**: Alignment (`text-left`, `text-center`, `text-right`), numeric figures (`tabular-nums`), and truncation (`truncate`, `line-clamp-*`).
    - **Theme Neutrals & Surfaces**: `bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, `bg-popover`, `text-popover-foreground`. Restrict `text-white`/`bg-black` to inverted overlays/tooltips. Use `chart-1` through `chart-5` strictly for data visualizations.
- **Missing Tokens**: Add the token, or ask; never fall back to a palette color. In Tailwind v4, registering a token requires `:root`, `.dark`, and an `@theme inline` mapping in `resources/css/app.css` (`--color-<name>: var(--<name>)`).

```tsx
// ❌ BAD: overrides padding, dimensions, palette colors, and icon placement
<Card className="p-4 gap-2">
  <CardHeader className="pt-2 pb-0">
    <CardTitle className="text-lg">Title</CardTitle>
  </CardHeader>
  <CardContent className="px-3">
    <Button className="h-7 px-2 text-xs">
      <RiAddLine className="mr-2 size-4" /> Add
    </Button>
    <Badge className="bg-emerald-50 text-emerald-700">Active</Badge>
  </CardContent>
</Card>

// ✅ GOOD: built-in props, size prop, data-icon, and composed fork
<Card size="sm">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button size="sm">
      <RiAddLine data-icon="inline-start" /> Add
    </Button>
    <StatusBadge status="success">Active</StatusBadge>
  </CardContent>
</Card>
```

## Standardized Semantic Colors and OKLCH Usage

Standardize all status colors using project OKLCH CSS variables in resources/css/app.css:

- success: primary lime (oklch(0.841 0.238 128.85) in light, oklch(0.768 0.233 130.85) in dark) with dark contrast text foreground (oklch(0.405 0.101 131.063)).
- destructive / danger: shadcn crimson OKLCH tokens.
- warning: amber/gold OKLCH (oklch(0.76 0.16 70) in light, oklch(0.78 0.15 72) in dark) with espresso contrast text foreground.
- info: sapphire blue OKLCH (oklch(0.58 0.15 245) in light, oklch(0.68 0.14 242) in dark).
- muted: neutral gray for inactive/draft states.
  Never use ad-hoc Tailwind color utilities (e.g., text-emerald-_, bg-rose-_, text-blue-_, bg-amber-_, text-red-*).
  Do not modify primitive shadcn components in resources/js/components/ui/ to add custom status colors; instead use dedicated forked components such as @/components/status-badge.

## Text Color Contrast - No Primary as Text

Do not use primary color as text color (e.g. text-primary). Primary color has low contrast with background when used as text. Use foreground with bold instead (e.g. text-foreground font-semibold/font-bold).
