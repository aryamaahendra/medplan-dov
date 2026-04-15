#!/bin/bash
set -e

# Cache configuration (only if not in local dev, but this is prod entrypoint)
echo "Caching application state..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run migrations if requested (useful for one-off deployment tasks)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force
fi

# Determine the command to run
if [ "$#" -gt 0 ]; then
    echo "Executing command: $@"
    exec "$@"
else
    # Default to starting Octane
    echo "Starting Octane with FrankenPHP..."
    exec php artisan octane:start --host=0.0.0.0 --port=8000 --server=frankenphp
fi
