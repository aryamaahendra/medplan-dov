# Inertia

- Client-side SPAs via server-side patterns. No SPA complexity.
- Components in `resources/js/pages` (or `vite.config.js`). Route via `Inertia::render()`, not Blade.
- ALWAYS use `search-docs` tool for version docs/examples.
- Activate `inertia-react-development` for client patterns.

# Inertia v3

- Support v1, v2, v3 features. Check docs first.
- New v3 features: standalone HTTP (`useHttp`), optimistic updates + auto rollback, layout props (`useLayoutProps`), instant visits, SSR via `@inertiajs/vite`, custom error pages.
- Kept from v2: deferred props, infinite scroll, merged props, polling, prefetch, once props, flash data.
- Deferred props: show empty state with pulse/animated skeleton.
- Axios removed. Use built-in XHR client + interceptors, or install Axios manually.
- `Inertia::lazy()` / `LazyProp` removed. Use `Inertia::optional()`.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) support nested arrays via dot notation.
- SSR automatic in Vite dev mode via `@inertiajs/vite`. No Node server needed in dev.
- Renamed events: `invalid` -> `httpException`, `exception` -> `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- `future` config removed. All v2 future options default enabled.