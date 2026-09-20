# Laravel Octane

App uses Laravel Octane long-running PHP server. Boots once, handles many requests in same process.

- Never store request-specific state in singletons or static properties (leaks across requests).
- Use `config('octane.server')` to detect active driver (`swoole`, `roadrunner`, or `frankenphp`).
- Prefer scoped bindings (`$this->app->scoped()`) over singletons for per-request services.

When working on Octane-specific features (concurrency, shared tables, memory, driver config, testing), invoke `octane-development` for detailed rules.
