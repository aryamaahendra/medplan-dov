# Laravel Sail

- Project in Sail Docker containers. MUST run commands via Sail.
- Start: `vendor/bin/sail up -d`. Stop: `vendor/bin/sail stop`.
- Open app: `vendor/bin/sail open`.
- Prefix PHP, Artisan, Composer, Node commands with `vendor/bin/sail`. Examples:
    - Run Artisan Commands: `vendor/bin/sail artisan migrate`
    - Install Composer packages: `vendor/bin/sail composer install`
    - Execute Node commands: `vendor/bin/sail npm run dev`
    - Execute PHP scripts: `vendor/bin/sail php [script]`
- View commands: `vendor/bin/sail`.