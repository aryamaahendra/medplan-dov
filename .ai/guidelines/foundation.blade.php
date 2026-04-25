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
