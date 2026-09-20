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