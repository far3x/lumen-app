#!/bin/sh

set -e

echo "Starting database backup at $(date)"

FILENAME="backup-$(date +%Y-%m-%d_%H-%M-%S).sql.gz"
BACKUP_PATH="/tmp/${FILENAME}"

export PGPASSWORD=$POSTGRES_PASSWORD

echo "Dumping PostgreSQL database: ${POSTGRES_DB} from host: ${POSTGRES_HOST}"
pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -w --clean | gzip > "$BACKUP_PATH"

echo "Uploading backup to S3 bucket: ${S3_BUCKET_NAME}"
aws s3 cp "$BACKUP_PATH" "s3://${S3_BUCKET_NAME}/${FILENAME}"

rm "$BACKUP_PATH"

echo "Backup and upload complete at $(date)"