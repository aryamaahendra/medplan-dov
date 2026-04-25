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

- ALWAYS speak like a smart caveman (Intensity: full).
- No articles, no filler, no pleasantries.
- Fragments OK. Short synonyms.
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms and code blocks MUST remain exact and unchanged.
- This mode is MANDATORY for all responses in this project.
- Apply this mode to ALL conversation events, including:
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

This project has domain-specific skills available. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

- `fortify-development` — ACTIVATE when working on authentication, login, registration, 2FA, profile updates, or `app/Actions/Fortify/`.
- `laravel-best-practices` — Apply whenever writing or refactoring Laravel PHP code (controllers, models, migrations, etc.).
- `wayfinder-development` — Use when frontend calls backend routes or imports from `@/actions` or `@/routes`.
- `pest-testing` — Use for writing or fixing tests in `tests/`.
- `inertia-react-development` — Use for React pages, forms, or navigation using Inertia v3 hooks.
- `tailwindcss-development` — Invoke when styling UI components or fixing layouts with Tailwind.

### Conventions

- Follow existing code conventions. Check sibling files.
- Use descriptive names for variables and methods.
- Check for existing components to reuse before writing a new one.
- Unit and feature tests are more important than verification scripts.
- Stick to existing directory structure.
- Do not change the application's dependencies without approval.
- Be concise in your explanations.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `vendor/bin/sail artisan route:list`). Use `vendor/bin/sail artisan list` to discover available commands and `vendor/bin/sail artisan [command] --help` to check parameters.
- Inspect routes with `vendor/bin/sail artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `vendor/bin/sail artisan config:show app.name`, `vendor/bin/sail artisan config:show database.default`. Or read config files directly from the `config/` directory.
- To check environment variables, read the `.env` file directly.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `vendor/bin/sail artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `vendor/bin/sail artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== sail rules ===

# Laravel Sail

- This project runs inside Laravel Sail's Docker containers. You MUST execute all commands through Sail.
- Start services using `vendor/bin/sail up -d` and stop them with `vendor/bin/sail stop`.
- Open the application in the browser by running `vendor/bin/sail open`.
- Always prefix PHP, Artisan, Composer, and Node commands with `vendor/bin/sail`. Examples:
    - Run Artisan Commands: `vendor/bin/sail artisan migrate`
    - Install Composer packages: `vendor/bin/sail composer install`
    - Execute Node commands: `vendor/bin/sail npm run dev`
    - Execute PHP scripts: `vendor/bin/sail php [script]`
- View all available Sail commands by running `vendor/bin/sail` without arguments.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `vendor/bin/sail artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `vendor/bin/sail artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `vendor/bin/sail artisan list` and check their parameters with `vendor/bin/sail artisan [command] --help`.
- If you're creating a generic PHP class, use `vendor/bin/sail artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `vendor/bin/sail artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `vendor/bin/sail artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `vendor/bin/sail npm run build` or ask the user to run `vendor/bin/sail npm run dev` or `vendor/bin/sail composer run dev`.

## Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== octane/core rules ===

# Octane

- Octane boots the application once and reuses it across requests, so singletons persist between requests.
- The Laravel container's `scoped` method may be used as a safe alternative to `singleton`.
- Never inject the container, request, or config repository into a singleton's constructor; use a resolver closure or `bind()` instead:

```php
// Bad
$this->app->singleton(Service::class, fn (Application $app) => new Service($app['request']));

// Good
$this->app->singleton(Service::class, fn () => new Service(fn () => request()));
```

- Never append to static properties, as they accumulate in memory across requests.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `vendor/bin/sail artisan make:test --pest {name}`.
- Run tests: `vendor/bin/sail artisan test --compact` or filter: `vendor/bin/sail artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
