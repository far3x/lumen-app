#!/bin/sh

set -e

echo "Configuring cron environment..."

> /etc/environment

printenv >> /etc/environment

crontab /app/crontab

echo "Cron setup complete. Starting cron daemon."

exec "$@"