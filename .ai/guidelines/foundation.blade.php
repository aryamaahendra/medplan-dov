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