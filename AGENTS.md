# Project Guidelines

## Laravel Boost Guidelines

### Foundational Context

- php - 8.5
- inertiajs/inertia-laravel - v3
- laravel/fortify - v1
- laravel/framework - v13
- laravel/octane - v2
- laravel/prompts - v0
- laravel/wayfinder - v0
- laravel/boost - v2
- laravel/mcp - v0
- laravel/pail - v1
- laravel/pint - v1
- laravel/sail - v1
- pestphp/pest - v4
- phpunit/phpunit - v12
- @inertiajs/react - v3
- react - v19
- tailwindcss - v4
- @laravel/vite-plugin-wayfinder - v0
- eslint - v9
- prettier - v3

### Skills Activation

Project domain skills available. MUST activate relevant skill when working in domain; do not wait:

- `fortify-development` — ACTIVATE when working on auth in Laravel.
- `laravel-best-practices` — Apply when writing, reviewing, refactoring Laravel PHP code.
- `wayfinder-development` — Use for Laravel Wayfinder auto-generated typed functions for controllers + routes.
- `pest-testing` — Use for Pest PHP testing in Laravel projects only.
- `inertia-react-development` — Develops Inertia.js v3 React client applications.
- `tailwindcss-development` — Always invoke when message includes 'tailwind'.

### Conventions

- Follow existing code conventions in application.
- Use descriptive names for variables + methods.
- Check existing components to reuse before writing new one.
- Unit + feature tests more important than verification scripts.
- Stick to existing directory structure.
- Do not change application dependencies without approval.
- Be concise in explanations.

### Code Quality & Pre-Commit

- Do NOT manually run lint, formatting, or type-check steps as part of the agent task loop: code formatting (Prettier, Pint), linting (ESLint), and full-project type and static analysis checks (TypeScript, PHPStan) are enforced automatically by the pre-commit hook.

## Laravel Boost Tools

- Laravel Boost: MCP server with project-specific tools.
- Use `database-query` for read-only database queries.
- Use `database-schema` to inspect table structure.
- Use `get-absolute-url` to resolve project URLs.
- Use `browser-logs` to read browser logs.

## PHP Best Practices

- Always use curly braces for control structures.
- Use PHP 8 constructor property promotion.
- Use explicit return type declarations + type hints.
- Use TitleCase for Enum keys.
- Prefer PHPDoc blocks over inline comments.

## Laravel Sail

- Project runs in Laravel Sail Docker containers. Execute all commands through Sail.
- Always prefix PHP, Artisan, Composer, Node commands with `vendor/bin/sail`.

## Testing

- Programmatically test every change.
- Run tests: `vendor/bin/sail artisan test --compact`.

## Inertia v3

- Use all Inertia features from v1, v2, v3.
- Components live in `resources/js/pages`.
- Use `Inertia::render()` for server-side routing.

===

<laravel-boost-guidelines>
=== .ai/agent-skills rules ===

## Agent skills

### Issue tracker

Local markdown under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Roles: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`CONTEXT.md` + `docs/adr/`). See `docs/agents/domain.md`.

=== foundation rules ===

# Laravel Boost Guidelines

Follow Laravel maintainer guidelines closely.

## Foundational Context

PHP 8.5 Laravel app. Match installed major version; never assume.

Check versions before using package API:

- PHP: `composer show --direct` or `composer show <vendor/package>`.
- JS: check `package.json`.

## Skills Activation

Skills in `**/skills/**`. Must activate matching domain skill immediately.

## Conventions

- Match sibling files for structure, approach, naming.
- Descriptive names: `isRegisteredForDiscounts`, not `discount()`.
- Reuse existing components first.

## Verification Scripts

- No verification scripts or tinker when unit/feature tests prove work. Tests priority.

## Application Structure & Architecture

- Keep existing directories; no new base folders without approval.
- No dependency changes without approval.

## Frontend Bundling

- Missing UI changes: suggest `vendor/bin/sail npm run build`, `vendor/bin/sail npm run dev`, or `vendor/bin/sail composer run dev`.

## Documentation Files

- Create docs only if user explicitly asks.

## Replies

- Ultra-terse. Key facts only; skip obvious.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost MCP server built for app. Prefer Boost tools over shell commands or file reads.
- Use `database-query` for read-only queries, not raw SQL in tinker.
- Use `database-schema` inspect tables before migrations/models.
- Use `get-absolute-url` resolve URL scheme, domain, port before sharing.
- Use `browser-logs` fetch recent browser logs/errors. Ignore old.

## Searching Documentation (IMPORTANT)

- Run `search-docs` before changes touching Laravel APIs, behavior, config, or syntax. Skip copy edits. Reuse context.
- Pass `packages` array scope results when packages known.
- Query multiple broad topics: `['rate limiting', 'routing rate limiting', 'routing']`.
- Omit package names from queries. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Words auto-stemmed AND logic: `rate limit` matches "rate" AND "limit".
2. `"quoted phrases"` exact order: `"infinite scroll"`.
3. Combine words + phrases: `middleware "rate limit"`.
4. Multiple queries OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- Rules live in `.ai/rules`. Framework rules in `.ai/rules/boost`. Before plan mode or create/edit file: check @.ai/rules/index.md, read matching glob files, run `grep -rin 'keyword' .ai/rules`. Follow rules before writing code. Skip if `.ai/rules` missing, continue without `.ai/rules`.
- Run `record-rule` only on explicit user request. User task steps not rules. Pass `glob` (e.g. `app/Http/Controllers/**`), short `title`, short `note`. Use `record-rule`, never personal session memory.

## Artisan

- Run CLI Artisan commands: `vendor/bin/sail artisan route:list`. List: `vendor/bin/sail artisan list`. Help: `vendor/bin/sail artisan [command] --help`.
- Routes: `vendor/bin/sail artisan route:list`. Flags: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read config: `vendor/bin/sail artisan config:show app.name`, `vendor/bin/sail artisan config:show database.default`. Or read `config/` files.

## Tinker

- Debug/test PHP in app context. Never create models without approval; use factories in tests. Prefer Artisan over tinker code.
- Escape shell with single quotes: `vendor/bin/sail artisan tinker --execute 'Your::code();'`
- Inner PHP strings use double quotes: `vendor/bin/sail artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even single-line.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. No empty zero-parameter `__construct()` methods unless private constructor.
- Use explicit return types + param type hints: `function isAccessible(User $user, ?string $path = null): bool`
- TitleCase Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Inline comments only for complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== sail rules ===

# Laravel Sail

- Project in Sail Docker containers. MUST run commands via Sail.
- Start: `vendor/bin/sail up -d`. Stop: `vendor/bin/sail stop`.
- Open app: `vendor/bin/sail open`.
- Prefix PHP, Artisan, Composer, Node commands with `vendor/bin/sail`. Examples:
    - Run Artisan Commands: `vendor/bin/sail artisan migrate`
    - Install Composer packages: `vendor/bin/sail composer install`
    - Execute Node commands: `vendor/bin/sail npm run dev`
    - Execute PHP scripts: `vendor/bin/sail php [script]`
- View commands: `vendor/bin/sail`.

=== tests rules ===

# Test Enforcement

- Add/update tests for behavior + logic changes giving regression coverage.
- Pure copy, styling, layout-only changes skip tests.
- Run affected tests; ensure pass.
- Test changed behavior + key failure modes only.
- Read `testing-best-practices` skill before writing tests.

=== inertia-laravel/core rules ===

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

=== laravel/core rules ===

# Do Things the Laravel Way

- Create files (migrations, controllers, models): `vendor/bin/sail artisan make:`. List commands: `vendor/bin/sail artisan list`. Check params: `vendor/bin/sail artisan [command] --help`.
- Generic PHP class: `vendor/bin/sail artisan make:class`.
- Automate runs: pass `--no-interaction` and `--options`.

### Model Creation

- Create factories + seeders with models. Check options: `vendor/bin/sail artisan make:model --help`.

## APIs & Eloquent Resources

- Default Eloquent API Resources + API versioning. Match existing app conventions.

## URL Generation

- Use named routes + `route()`.

## Testing

- Use factories for test models. Check custom states first.
- Faker: `$this->faker->word()` or `fake()->randomDigit()`. Match existing convention whether `$this->faker` or `fake()`.
- Create tests: `vendor/bin/sail artisan make:test [options] {name}`. Add `--unit` for unit test. Prefer feature tests.

## Vite Error

- Fix "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest": run `vendor/bin/sail npm run build` or ask user run `vendor/bin/sail npm run dev` or `vendor/bin/sail composer run dev`.

=== laravel-octane/core rules ===

# Laravel Octane

App use Laravel Octane long-running PHP server. Boot once, handle many requests same process.

- Never store request state in singletons or static properties (leak across requests).
- Use `config('octane.server')` detect driver (`frankenphp`).
- Prefer scoped bindings (`$this->app->scoped()`) over singletons for per-request services.

Octane features (concurrency, shared tables, memory, driver config, testing): invoke `octane-development` for rules.

=== wayfinder/core rules ===

# Laravel Wayfinder

Generate TypeScript functions for Laravel routes. Import from `@/actions/` or `@/routes/`.

=== pest/core rules ===

# Pest

- Project uses Pest. Create tests: `vendor/bin/sail artisan make:test --pest {name}`.
- Omit suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read `testing-best-practices` skill for coverage, naming, structure, dependency isolation, review.
- Never delete tests or test files without approval.

## Running Tests

- Run narrowest tests covering change. Pass file path or `--filter=testName` to `vendor/bin/sail artisan test --compact`.
- Rerun after each change.
- Call runner directly: `vendor/bin/sail bin pest`. Accepts file path + `--filter=testName`.
- When feature tests pass, ask user run full suite: `vendor/bin/sail artisan test --compact`.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` for Inertia React client patterns.

=== maatwebsite/excel/core rules ===

# Laravel Excel

- Use `maatwebsite/excel` for spreadsheet exports, imports, queued work, CSV, PhpSpreadsheet in Laravel.
- Use explicit export/import classes with concerns; avoid ad-hoc generation in controllers, jobs, commands.
- Trigger `laravel-excel` skill for `Excel::download()`, `Excel::store()`, `Excel::queue()`, `Excel::raw()`, `Excel::import()`, `Excel::toArray()`, `Excel::toCollection()`, export/import concerns, queued jobs, validation, CSV settings, styling, events, formulas, charts, drawings, sheets, mapped cells, macros, config, cache, transactions, temp files, `Excel::fake()`.
- Check `references/package.md` feature matrix for broad docs, full-feature tasks, missing-feature audits.
- Large datasets: use `FromQuery` + queued exports, or `WithChunkReading` + `WithBatchInserts` for imports.
- Test intent with `Excel::fake()`. Inspect files only to verify cell contents, formatting, sheets, writer behavior.

</laravel-boost-guidelines>
