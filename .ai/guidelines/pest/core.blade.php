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
