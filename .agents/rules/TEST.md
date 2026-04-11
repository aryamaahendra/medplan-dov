---
trigger: model_decision
description: when working to with test, pest, unit test
---

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `./vendor/bin/sail artisan test --compact` with a specific filename or filter.
- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- Run tests: `./vendor/bin/sail artisan test --compact` or filter: `./vendor/bin/sail artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.
