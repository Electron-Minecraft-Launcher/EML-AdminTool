#!/bin/sh
set -e

echo "🔧 Setting up environment variables..."
if [ -f /app/env/.env ]; then
  echo ".env file found."
else
  echo ".env file not found, creating a new one."
  cp /app/env/.env.default /app/env/.env
fi
if [ ! -L /app/.env ]; then
  echo "Creating symlink to .env file..."
  ln -s /app/env/.env /app/.env
else
  echo "Symlink to .env file already exists."
fi

echo "⏳ Waiting for database..."
until nc -z dbs 5432; do
  sleep 1
done

echo "✅ Database available. Applying 'prisma db push'..."
npx dotenv -e /app/.env -- npx prisma db push --accept-data-loss

echo "🚀 Starting application..."
exec npm run dev