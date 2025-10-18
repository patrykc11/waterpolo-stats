#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
until npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database ready, running migrations..."
npx prisma migrate deploy

echo "Running seed..."
npm run prisma:seed

echo "Starting application..."
exec node server.js
