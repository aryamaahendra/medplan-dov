# Laravel Octane

App use Laravel Octane long-running PHP server. Boot once, handle many requests same process.

- Never store request state in singletons or static properties (leak across requests).
- Use `config('octane.server')` detect driver (`swoole`, `roadrunner`, `frankenphp`).
- Prefer scoped bindings (`$this->app->scoped()`) over singletons for per-request services.

Octane features (concurrency, shared tables, memory, driver config, testing): invoke `octane-development` for rules.