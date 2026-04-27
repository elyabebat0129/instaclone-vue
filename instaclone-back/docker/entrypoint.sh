#!/usr/bin/env bash
set -euo pipefail

cd /app

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        touch .env
    fi
fi

if [ -z "${APP_KEY:-}" ] && ! grep -q '^APP_KEY=.\+' .env; then
    php artisan key:generate --force
fi

if [ "${DB_CONNECTION:-}" = "mysql" ] && [ -n "${DB_HOST:-}" ]; then
    echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT:-3306}..."
    db_ready=false

    for i in $(seq 1 60); do
        if php -r '
            $host = getenv("DB_HOST") ?: "127.0.0.1";
            $port = getenv("DB_PORT") ?: "3306";
            $database = getenv("DB_DATABASE") ?: "";
            $username = getenv("DB_USERNAME") ?: "root";
            $password = getenv("DB_PASSWORD") ?: "";

            try {
                new PDO(
                    "mysql:host={$host};port={$port};dbname={$database}",
                    $username,
                    $password,
                    [PDO::ATTR_TIMEOUT => 2],
                );
                exit(0);
            } catch (Throwable $exception) {
                exit(1);
            }
        ' >/dev/null 2>&1; then
            db_ready=true
            break
        fi

        sleep 1
    done

    if [ "${db_ready}" != "true" ]; then
        echo "MySQL did not become ready in time."
        exit 1
    fi
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force --no-interaction || true
fi

if [ "${APP_ENV:-production}" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan event:cache
else
    php artisan config:clear
    php artisan route:clear
fi

php artisan storage:link --force 2>/dev/null || true

exec "$@"
