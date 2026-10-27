# Do Things the Laravel Way

- Create files (migrations, controllers, models): `vendor/bin/sail artisan make:`. List commands: `vendor/bin/sail artisan list`. Check params: `vendor/bin/sail artisan [command] --help`.
- Generic PHP class: `vendor/bin/sail artisan make:class`.
- Automate runs: pass `--no-interaction` and `--options`.

### Model Creation

- Create factories + seeders with models. Check options: `vendor/bin/sail artisan make:model --help`.

## APIs & Eloquent Resources

- Default Eloquent API Resources + API versioning. Match existing app conventions.

## URL Generation

- Use named routes + `route()`.

## Testing

- Use factories for test models. Check custom states first.
- Faker: `$this->faker->word()` or `fake()->randomDigit()`. Match existing convention whether `$this->faker` or `fake()`.
- Create tests: `vendor/bin/sail artisan make:test [options] {name}`. Add `--unit` for unit test. Prefer feature tests.

## Vite Error

- Fix "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest": run `vendor/bin/sail npm run build` or ask user run `vendor/bin/sail npm run dev` or `vendor/bin/sail composer run dev`.