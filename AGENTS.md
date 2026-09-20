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

Local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical roles: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context (`CONTEXT.md` + `docs/adr/`). See `docs/agents/domain.md`.

=== foundation rules ===

# Laravel Boost Guidelines

Laravel Boost guidelines curated by Laravel maintainers. Follow closely.

## Foundational Context

Laravel app on PHP 8.5. Expert with Laravel ecosystem. Always match installed major version; do not assume version.

Confirm installed versions before relying on package API:
- PHP packages: `composer show --direct` for direct deps with versions, or `composer show <vendor/package>` for single package.
- JS packages: check `package.json` for installed versions.

## Skills Activation

Domain skills available in `**/skills/**`. MUST activate relevant skill when working in domain; do not wait.

## Conventions

- Follow existing conventions. When creating or editing file, check sibling files for structure, approach, naming.
- Use descriptive names for variables + methods. E.g., `isRegisteredForDiscounts`, not `discount()`.
- Check existing components to reuse before writing new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover functionality and prove work. Unit + feature tests more important.

## Application Structure & Architecture

- Stick to existing directory structure; do not create new base folders without approval.
- Do not change dependencies without approval.

## Frontend Bundling

- Frontend change missing in UI: may need `vendor/bin/sail npm run build`, `vendor/bin/sail npm run dev`, or `vendor/bin/sail composer run dev`. Ask user.

## Documentation Files

- Only create documentation files if explicitly requested by user.

## Replies

- Be concise. Focus on important facts; do not explain obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost MCP server tools designed for app. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` for read-only database queries instead of raw SQL in tinker.
- Use `database-schema` to inspect table structure before migrations or models.
- Use `get-absolute-url` to resolve correct scheme, domain, port for project URLs before sharing with user.
- Use `browser-logs` for browser logs, errors, exceptions. Recent logs only; ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes depending on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip for copy-only edits where package docs irrelevant. Reuse context results instead of searching again.
- Pass `packages` array to scope results when relevant packages known.
- Use multiple broad topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`.
- Do not add package names to queries (package info already shared). Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Words for auto-stemmed AND logic: `rate limit` matches "rate" AND "limit".
2. `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words + phrases for mixed queries: `middleware "rate limit"`.
4. Multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- Committed area-grouped rules live in `.ai/rules` when directory exists (settled decisions, traps, standing constraints). Package and framework rules under `.ai/rules/boost` apply to specific paths. Before entering plan mode or create/edit any file: open @.ai/rules/index.md, read rule files matching path globs, run `grep -rin 'keyword' .ai/rules`. Do not write code until reading + following matching rules. If `.ai/rules` missing, continue without `.ai/rules`.
- Record rule with `record-rule` only when user explicitly asks. Task instructions not rules ("remove typo", "use X here" are work, not rules). Never record rule on own initiative. When asked, pass `glob` (e.g. `app/Http/Controllers/**`), short `title`, few-line `note`. Use `record-rule` (shared across team in repo), not personal session memory.

## Artisan

- Run Artisan commands via CLI (e.g., `vendor/bin/sail artisan route:list`). Discover: `vendor/bin/sail artisan list`. Check params: `vendor/bin/sail artisan [command] --help`.
- Inspect routes: `vendor/bin/sail artisan route:list`. Filter: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read config via dot notation: `vendor/bin/sail artisan config:show app.name`, `vendor/bin/sail artisan config:show database.default`. Or read files in `config/`.

## Tinker

- Execute PHP in app context for debugging + testing. Do not create models without approval; prefer factories in tests. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `vendor/bin/sail artisan tinker --execute 'Your::code();'`
  - Double quotes for inner PHP strings: `vendor/bin/sail artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless constructor private.
- Use explicit return type declarations + type hints for method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Deploy Laravel using [Laravel Cloud](https://cloud.laravel.com/).
- Activate `deploying-to-cloud` skill when deploying to Laravel Cloud, configuring Cloud environments or resources, using Cloud CLI, or troubleshooting Cloud deployments.

=== sail rules ===

# Laravel Sail

- Project runs in Laravel Sail Docker containers. MUST execute all commands through Sail.
- Start services: `vendor/bin/sail up -d`; stop: `vendor/bin/sail stop`.
- Open app in browser: `vendor/bin/sail open`.
- Always prefix PHP, Artisan, Composer, Node commands with `vendor/bin/sail`. Examples:
    - Run Artisan Commands: `vendor/bin/sail artisan migrate`
    - Install Composer packages: `vendor/bin/sail composer install`
    - Execute Node commands: `vendor/bin/sail npm run dev`
    - Execute PHP scripts: `vendor/bin/sail php [script]`
- View available Sail commands: run `vendor/bin/sail` without arguments.

=== tests rules ===

# Test Enforcement

- Add or update tests for behavior + logic changes when test provides meaningful regression coverage.
- Pure copy, styling, layout-only changes do not require new or updated tests.
- Run affected tests when coverage applies; ensure pass.
- Test changed behavior + important failure modes; do not add tests beyond them.
- Read `testing-best-practices` skill before writing tests.

=== inertia-laravel/core rules ===

# Inertia

- Fully client-side rendered SPAs without SPA complexity, using server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia docs + code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, v3. Check docs before making changes.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with auto rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom error pages.
- Carried from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add empty state with pulsing or animated skeleton.
- Axios removed. Use built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- `future` config namespace removed - all v2 future options always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `vendor/bin/sail artisan make:` commands to create new files (migrations, controllers, models, etc.). List commands: `vendor/bin/sail artisan list`. Check params: `vendor/bin/sail artisan [command] --help`.
- For generic PHP class: `vendor/bin/sail artisan make:class`.
- Pass `--no-interaction` to Artisan commands for automated execution. Pass correct `--options`.

### Model Creation

- When creating models, create factories + seeders too. Check options: `vendor/bin/sail artisan make:model --help`.

## APIs & Eloquent Resources

- Default to Eloquent API Resources + API versioning unless existing API routes do not; follow existing app convention.

## URL Generation

- Prefer named routes + `route()` function for links.

## Testing

- Use factories when creating models for tests. Check custom states before manual setup.
- Faker: `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether `$this->faker` or `fake()`.
- Create tests: `vendor/bin/sail artisan make:test [options] {name}` for feature test, pass `--unit` for unit test. Most tests should be feature tests.

## Vite Error

- "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error: run `vendor/bin/sail npm run build` or ask user to run `vendor/bin/sail npm run dev` or `vendor/bin/sail composer run dev`.

=== laravel-octane/core rules ===

# Laravel Octane

App uses Laravel Octane long-running PHP server. Boots once, handles many requests in same process.

- Never store request-specific state in singletons or static properties (leaks across requests).
- Use `config('octane.server')` to detect active driver (`swoole`, `roadrunner`, or `frankenphp`).
- Prefer scoped bindings (`$this->app->scoped()`) over singletons for per-request services.

When working on Octane-specific features (concurrency, shared tables, memory, driver config, testing), invoke `octane-development` for detailed rules.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If modified PHP files, must run `vendor/bin/sail bin pint --dirty --format agent` before finalizing changes to match code style.
- Do not run `vendor/bin/sail bin pint --test --format agent`, run `vendor/bin/sail bin pint --format agent` to fix formatting issues.

=== pest/core rules ===

# Pest

- Project uses Pest. Create tests with `vendor/bin/sail artisan make:test --pest {name}`.
- Do not include test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, review.
- Do not delete tests or test files without approval. Part of application.

## Running Tests

- Run narrowest set of tests covering change. Pass file path or `--filter=testName` to `vendor/bin/sail artisan test --compact`.
- Rerun test after each change.
- Run `vendor/bin/sail bin pest` to call test runner directly. Accepts file path + `--filter=testName` arguments.
- After feature tests pass, ask user to run complete suite with `vendor/bin/sail artisan test --compact`.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

=== maatwebsite/excel/core rules ===

# Laravel Excel

- Use `maatwebsite/excel` for spreadsheet exports, imports, queued spreadsheet work, CSV handling, PhpSpreadsheet integration in Laravel applications.
- Prefer explicit export/import classes with package concerns over ad-hoc spreadsheet generation in controllers, jobs, commands.
- Activate `laravel-excel` skill when working with `Excel::download()`, `Excel::store()`, `Excel::queue()`, `Excel::raw()`, `Excel::import()`, `Excel::toArray()`, `Excel::toCollection()`, export/import concerns, queued imports/exports, validation, CSV settings, styling, events, formulas, charts, drawings, multiple sheets, mapped cells, macros, config, cache, transactions, temporary files, or `Excel::fake()`.
- For broad docs, all-feature tasks, or missing-feature audits, use skill's `references/package.md` feature matrix before answering.
- For large datasets, prefer `FromQuery` with queued exports or `WithChunkReading` and `WithBatchInserts` for imports.
- Test spreadsheet behavior with `Excel::fake()` when asserting dispatch/download/store/import intent; inspect generated files only when cell contents, formatting, sheets, or writer behavior must be proven.

</laravel-boost-guidelines>
