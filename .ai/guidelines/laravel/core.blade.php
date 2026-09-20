# Do Things the Laravel Way

- Use `vendor/bin/sail artisan make:` commands to create new files (migrations, controllers, models, etc.). List commands: `vendor/bin/sail artisan list`. Check params: `vendor/bin/sail artisan [command] --help`.
- For generic PHP class: `vendor/bin/sail artisan make:class`.
- Pass `--no-interaction` to Artisan commands for automated execution. Pass correct `--options`.

### Model Creation

- When creating models, create factories + seeders too. Check options: `vendor/bin/sail artisan make:model --help`.

## APIs & Eloquent Resources

- Default to Eloquent API Resources + API versioning unless existing API routes do not; follow existing app convention.

## URL Generation

- Prefer named routes + `route()` function for links.

## Testing

- Use factories when creating models for tests. Check custom states before manual setup.
- Faker: `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether `$this->faker` or `fake()`.
- Create tests: `vendor/bin/sail artisan make:test [options] {name}` for feature test, pass `--unit` for unit test. Most tests should be feature tests.

## Vite Error

- "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error: run `vendor/bin/sail npm run build` or ask user to run `vendor/bin/sail npm run dev` or `vendor/bin/sail composer run dev`.
