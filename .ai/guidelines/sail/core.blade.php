# Laravel Sail

- Project runs in Laravel Sail Docker containers. MUST execute all commands through Sail.
- Start services: `vendor/bin/sail up -d`; stop: `vendor/bin/sail stop`.
- Open app in browser: `vendor/bin/sail open`.
- Always prefix PHP, Artisan, Composer, Node commands with `vendor/bin/sail`. Examples:
    - Run Artisan Commands: `vendor/bin/sail artisan migrate`
    - Install Composer packages: `vendor/bin/sail composer install`
    - Execute Node commands: `vendor/bin/sail npm run dev`
    - Execute PHP scripts: `vendor/bin/sail php [script]`
- View available Sail commands: run `vendor/bin/sail` without arguments.
