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
