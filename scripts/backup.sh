#!/bin/bash

# Backup script for waterpolo-stats database
# Usage: ./scripts/backup.sh

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/waterpolo_backup_$TIMESTAMP.sql"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Creating backup..."

# Check if using Docker
if docker ps | grep -q waterpolo-db; then
    echo "📦 Using Docker container..."
    docker exec waterpolo-db pg_dump -U waterpolo waterpolo_stats > "$BACKUP_FILE"
else
    echo "💻 Using local PostgreSQL..."
    pg_dump -U waterpolo waterpolo_stats > "$BACKUP_FILE"
fi

# Compress backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"

echo "✅ Backup created: ${BACKUP_FILE}.gz"
echo "📊 Size: $(du -h ${BACKUP_FILE}.gz | cut -f1)"

# Keep only last 30 backups
echo "🧹 Cleaning old backups (keeping last 30)..."
ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true

echo "✅ Backup complete!"

