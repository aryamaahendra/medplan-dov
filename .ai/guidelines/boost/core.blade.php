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
