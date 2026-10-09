# Features Architecture & Layer Conventions

Vertical domain slice architecture for frontend code (`resources/js/features/`).

## Layer Directory Placement

Each business domain resides in `resources/js/features/{domain}/`:

```
resources/js/features/{domain}/
├── components/          # Domain-specific UI presentation, forms, dialogs
│   └── {domain}-columns.tsx  # TanStack table column definitions
├── hooks/               # Domain state, form handlers (use-{domain}-{page}.ts)
├── types/               # Domain type contracts ({domain}.types.ts)
└── utils/               # Domain calculations & pure helpers (formatters in @/lib/formatters)
```

## Downward-Only Dependency Hierarchy

```
pages → features → components → layouts → hooks, lib, types, stores, generated code
```

Common layers importable from any feature:

- `@/components/ui` (shadcn primitives)
- `@/components` (cross-domain composites: data-table, confirm-dialog, status-badge)
- `@/layouts` (app-layout, auth-layout)
- `@/hooks` (headless hooks used across 2+ domains)
- `@/lib` (`cn`, date/time formatters in `@/lib/formatters`)
- `@/types` (cross-domain contracts)
- `@/stores` (client state)
- `@/actions`, `@/routes`, `@/wayfinder` (generated code)

## Boundary Rules

1. **Bottom-up (Hard):** Shared layers (`components/*`, `layouts/*`, `hooks/*`, `lib/*`, `types/*`, `stores/*`) must NEVER import from `@/features/*`.
2. **Cross-feature (Hard):** Features may only `import type { ... } from '@/features/{sibling}/types/{sibling}.types'` using top-level type imports. Features must NEVER import runtime code (components, hooks, utils) from a sibling feature.
3. **Pages (Hard):** A page composer imports runtime code from at most ONE feature domain, plus common layers.
4. **Thin Composers (Hard):** Pages must be ≤ 100 non-blank lines (excluding import statements).
5. **Timezone:** Always format dates/times with `@/lib/formatters` (`Asia/Makassar`).
