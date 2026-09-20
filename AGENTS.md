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

This project has domain-specific skills available. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

- `fortify-development` — ACTIVATE when the user works on authentication in Laravel.
- `laravel-best-practices` — Apply this skill whenever writing, reviewing, or refactoring Laravel PHP code.
- `wayfinder-development` — Use this skill for Laravel Wayfinder which auto-generates typed functions for Laravel controllers and routes.
- `pest-testing` — Use this skill for Pest PHP testing in Laravel projects only.
- `inertia-react-development` — Develops Inertia.js v3 React client-side applications.
- `tailwindcss-development` — Always invoke when the user's message includes 'tailwind' in any form.

### Conventions

- You must follow all existing code conventions used in this application.
- Use descriptive names for variables and methods.
- Check for existing components to reuse before writing a new one.
- Unit and feature tests are more important than verification scripts.
- Stick to existing directory structure.
- Do not change the application's dependencies without approval.
- Be concise in your explanations.

## Laravel Boost Tools

- Laravel Boost is an MCP server with tools designed specifically for this application.
- Use `database-query` to run read-only queries against the database.
- Use `database-schema` to inspect table structure.
- Use `get-absolute-url` to resolve project URLs.
- Use `browser-logs` to read browser logs.

## PHP Best Practices

- Always use curly braces for control structures.
- Use PHP 8 constructor property promotion.
- Use explicit return type declarations and type hints.
- Use TitleCase for Enum keys.
- Prefer PHPDoc blocks over inline comments.

## Laravel Sail

- This project runs inside Laravel Sail's Docker containers. Execute all commands through Sail.
- Always prefix PHP, Artisan, Composer, and Node commands with `vendor/bin/sail`.

## Testing

- Every change must be programmatically tested.
- Run tests: `vendor/bin/sail artisan test --compact`.

## Inertia v3

- Use all Inertia features from v1, v2, and v3.
- Components live in `resources/js/pages`.
- Use `Inertia::render()` for server-side routing.

## Caveman Mode

- ALWAYS speak like a smart caveman (Intensity: full).
- Follow rules in `/home/meeatwork/.gemini/antigravity/caveman/skills/caveman/SKILL.md`.
- No articles, no filler, no pleasantries.
- Fragments OK. Short synonyms.
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms and code blocks MUST remain exact and unchanged.
- This mode is MANDATORY for all responses in this project.

===

<laravel-boost-guidelines>
=== .ai/caveman rules ===

# Caveman Mode

- Speak like smart caveman (Intensity: full).
- No articles, filler, pleasantries.
- Fragments OK. Short synonyms.
- Pattern: `[thing] [action] [reason]. [next step].`
- Tech terms + code blocks stay exact.
- Mandatory for all project responses.
- Apply to all conversation events:
    - Normal chat responses.
    - Implementation plans (artifacts).
    - Walkthroughs (artifacts).
    - Task summaries.
    - Research notes.
- Follow rules in `/home/meeatwork/.gemini/antigravity/caveman/skills/caveman/SKILL.md`.

=== foundation rules ===

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

Domain skills available. MUST activate skill when working in domain.

- `fortify-development` — auth, login, register, 2FA, profile, `app/Actions/Fortify/`.
- `laravel-best-practices` — write/refactor Laravel PHP (controllers, models, migrations).
- `wayfinder-development` — frontend calls routes or imports `@/actions` / `@/routes`.
- `pest-testing` — write/fix tests in `tests/`.
- `inertia-react-development` — React pages, forms, navigation with Inertia v3.
- `tailwindcss-development` — style UI / layout with Tailwind.

### Conventions

- Follow code conventions. Check sibling files.
- Descriptive names for vars/methods.
- Reuse existing components before writing new.
- Unit/feature tests over verification scripts.
- Keep directory structure.
- No dependency changes without approval.
- Concise explanations.

=== boost rules ===

# Laravel Boost

## Tools

- MCP tools available. Prefer Boost tools over manual shell / file reads.
- `database-query`: read-only SQL queries (avoid tinker raw SQL).
- `database-schema`: inspect tables before migrations/models.
- `get-absolute-url`: resolve URL before sharing with user.
- `browser-logs`: read recent browser errors. Ignore old logs.

## Searching Documentation (IMPORTANT)

- `search-docs` before changes needing Laravel ecosystem APIs / syntax. Skip copy-only edits.
- Pass `packages` array when known.
- Use broad topic queries: `['rate limiting', 'routing rate limiting', 'routing']`.
- No package names in queries (already scoped).

### Search Syntax

1. Words = AND: `rate limit`.
2. Quotes = exact: `"infinite scroll"`.
3. Mixed: `middleware "rate limit"`.
4. Multiple queries = OR: `queries=["authentication", "middleware"]`.

## Project Rules

- Committed rules in `.ai/rules` if dir exists. Scoped rules under `.ai/rules/boost`. Open @.ai/rules/index.md, read matching rules, grep `.ai/rules`. If missing, continue without.
- `record-rule` only when user explicitly asks. Never auto-record. Pass `glob`, `title`, `note`.

## Artisan

- Run Artisan CLI: `vendor/bin/sail artisan route:list`. Discover: `vendor/bin/sail artisan list` / `vendor/bin/sail artisan [command] --help`.
- Inspect routes: `vendor/bin/sail artisan route:list` (`--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`).
- Config values: `vendor/bin/sail artisan config:show app.name` / read `config/`.

## Tinker

- App context PHP execution. No models without user approval; prefer test factories / Artisan.
- Single quotes prevent shell expansion: `vendor/bin/sail artisan tinker --execute 'Your::code();'`
  - Double quotes inside: `vendor/bin/sail artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always curly braces for control structures.
- PHP 8 constructor promotion: `public function __construct(public GitHub $github) { }`. No empty zero-param `__construct()` unless private.
- Explicit return types + parameter type hints: `function isAccessible(User $user, ?string $path = null): bool`
- TitleCase Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- PHPDoc blocks over inline comments. Inline comments only for complex logic.
- Array shape types in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Deploy via [Laravel Cloud](https://cloud.laravel.com/).
- Activate `deploying-to-cloud` skill when deploying, configuring Cloud resources, using Cloud CLI, or troubleshooting deploys.

=== sail rules ===

# Laravel Sail

- Project runs in Laravel Sail Docker containers. Execute all commands via Sail.
- Start: `vendor/bin/sail up -d`, stop: `vendor/bin/sail stop`.
- Open browser: `vendor/bin/sail open`.
- Prefix PHP, Artisan, Composer, Node commands with `vendor/bin/sail`:
    - Artisan: `vendor/bin/sail artisan migrate`
    - Composer: `vendor/bin/sail composer install`
    - Node: `vendor/bin/sail npm run dev`
    - PHP: `vendor/bin/sail php [script]`
- View commands: `vendor/bin/sail`.

=== tests rules ===

# Test Enforcement

- Add/update tests when change has regression risk.
- Copy, style, layout changes do not need tests.
- Run affected tests; ensure pass.
- Test changed behavior + key failure modes only.
- Read `testing-best-practices` skill before writing tests.

=== inertia-laravel/core rules ===

# Inertia

- Fully client-side rendered SPAs without SPA complexity; uses server routing.
- Components live in `resources/js/pages`. Use `Inertia::render()`.
- Use `search-docs` tool for Inertia docs/examples.
- Activate `inertia-react-development` for client patterns.

# Inertia v3

- Check docs for v1/v2/v3 approach.
- v3 features: standalone HTTP (`useHttp`), optimistic updates with rollback, layout props (`useLayoutProps`), instant visits, SSR via `@inertiajs/vite`, custom exception handling.
- Carried from v2: deferred props, infinite scroll, merge props, polling, prefetch, once props, flash data.
- Deferred props need empty state with skeleton.
- Axios removed. Use built-in XHR client.
- `Inertia::lazy()` removed. Use `Inertia::optional()`.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work with dot notation in nested arrays.
- SSR works in Vite dev via `@inertiajs/vite`.
- Renamed events: `invalid` -> `httpException`, `exception` -> `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- `future` config removed (v2 future options always on).

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `vendor/bin/sail artisan make:` to create files (migrations, controllers, models). List: `vendor/bin/sail artisan list`.
- Generic class: `vendor/bin/sail artisan make:class`.
- Pass `--no-interaction` to Artisan commands.

### Model Creation

- Create factories/seeders with models.

## APIs & Eloquent Resources

- Default to Eloquent API Resources + versioning unless existing code differs.

## URL Generation

- Prefer named routes and `route()` function.

## Testing

- Model tests use factories with custom states where available.
- Faker: `$this->faker->word()` or `fake()->randomDigit()`. Match existing convention.
- Create tests: `vendor/bin/sail artisan make:test [options] {name}`. Pass `--unit` for unit test; prefer feature tests.

## Vite Error

- "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest": run `vendor/bin/sail npm run build` or ask user to run dev server.

=== laravel-octane/core rules ===

# Laravel Octane

Application runs on persistent server. Boots once; handles multiple requests.

- Never store request state in singletons or static properties (leaks across requests).
- Detect driver: `config('octane.server')` (`swoole`, `roadrunner`, `frankenphp`).
- Scoped bindings (`$this->app->scoped()`) over singletons for per-request services.

Activate `octane-development` for concurrency, shared tables, memory, config, testing.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder for TypeScript route functions. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pest/core rules ===

# Pest

- Create tests: `vendor/bin/sail artisan make:test --pest {name}`.
- Omit test suite directory in `{name}` (e.g. `SomeFeatureTest`, not `Feature/SomeFeatureTest`).
- Read `testing-best-practices` skill.
- Do not delete tests/test files without approval.

## Running Tests

- Run narrowest test set: `vendor/bin/sail artisan test --compact` with file path or `--filter=testName`.
- Rerun test after each change.
- Run `vendor/bin/sail bin pest` directly (accepts path and `--filter=testName`).
- After feature tests pass, ask user to run complete suite with `vendor/bin/sail artisan test --compact`.

=== inertia-react/core rules ===

# Inertia + React

- Activate `inertia-react-development` when working with Inertia React client patterns.

=== maatwebsite/excel/core rules ===

# Laravel Excel

- Use `maatwebsite/excel` for spreadsheet exports/imports, queued spreadsheets, CSV handling, PhpSpreadsheet.
- Prefer explicit export/import classes with concerns over ad-hoc generation.
- Activate `laravel-excel` skill for package APIs, queued jobs, concerns, validation, formulas, multi-sheet, `Excel::fake()`.
- Check `references/package.md` feature matrix for broad docs / missing features.
- Large datasets: `FromQuery` with queued exports; `WithChunkReading` and `WithBatchInserts` for imports.
- Test with `Excel::fake()` for dispatch/download/store/import intent; inspect files only for cell contents/formatting/sheets proof.

</laravel-boost-guidelines>
