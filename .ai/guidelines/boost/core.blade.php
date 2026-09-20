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
