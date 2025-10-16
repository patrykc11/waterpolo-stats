#!/bin/bash

# Deployment script
# Usage: ./scripts/deploy.sh [production|staging]

set -e

ENV=${1:-production}

echo "🚀 Deploying to $ENV..."

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🏗️  Building application..."
npm run build

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Restart application
echo "🔄 Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart waterpolo
elif command -v docker-compose &> /dev/null; then
    docker-compose restart app
else
    echo "⚠️  Please restart the application manually"
fi

echo "✅ Deployment complete!"
echo "🌐 Application should be available at your configured URL"

