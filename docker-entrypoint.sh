#!/bin/sh
echo "Starting Fonzkart production server..."

# Fallback to Coolify's POSTGRES_PRISMA_URL if DATABASE_URL is not explicitly set
if [ -z "$DATABASE_URL" ] && [ -n "$POSTGRES_PRISMA_URL" ]; then
  echo "DATABASE_URL is not set. Falling back to POSTGRES_PRISMA_URL from Coolify."
  export DATABASE_URL="$POSTGRES_PRISMA_URL"
fi

# Ensure database is pushed (this resolves Suspect B: missing tables)
echo "Running database migrations..."
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

echo "Starting Next.js..."
exec node server.js
