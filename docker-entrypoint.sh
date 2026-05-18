#!/bin/sh
set -e

if [ ! -f node_modules/.package-lock.json ] && [ ! -d node_modules/sequelize ]; then
  echo "Installing dependencies..."
  npm ci
fi

echo "Waiting for database..."
until pg_isready -h "${DB_HOST:-db}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-controlescolar}" >/dev/null 2>&1; do
  sleep 1
done
echo "Database is ready."

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running migrations..."
  npm run migrate
fi

if [ "${RUN_SEED}" = "true" ]; then
  echo "Seeding database..."
  npm run seed
fi

exec "$@"
