#!/bin/bash

# Restore script for waterpolo-stats database
# Usage: ./scripts/restore.sh backup_file.sql.gz

set -e

if [ -z "$1" ]; then
    echo "❌ Error: No backup file specified"
    echo "Usage: ./scripts/restore.sh backup_file.sql.gz"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/*.sql.gz 2>/dev/null || echo "  (no backups found)"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  WARNING: This will OVERWRITE the current database!"
echo "Backup file: $BACKUP_FILE"
read -p "Continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo "🔄 Extracting backup..."
TEMP_SQL="/tmp/waterpolo_restore_$$.sql"
gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"

echo "🗄️  Restoring database..."

# Check if using Docker
if docker ps | grep -q waterpolo-db; then
    echo "📦 Using Docker container..."
    docker exec -i waterpolo-db psql -U waterpolo waterpolo_stats < "$TEMP_SQL"
else
    echo "💻 Using local PostgreSQL..."
    psql -U waterpolo waterpolo_stats < "$TEMP_SQL"
fi

rm "$TEMP_SQL"

echo "✅ Restore complete!"

