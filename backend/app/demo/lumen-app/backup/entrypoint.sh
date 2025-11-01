#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# If the first argument is 'now', run the backup script immediately and exit.
if [ "$1" = "now" ]; then
    echo "Executing immediate one-off backup..."
    exec /app/backup.sh
fi

# --- Default behavior for scheduled backups ---
echo "Configuring cron environment for scheduled backups..."

# Take all environment variables from Docker and make them available to cron
printenv > /etc/environment

# Add our crontab to the system's cron directory
crontab /app/crontab

# Start the cron daemon in the background. The -b flag is for background.
echo "Starting cron daemon in the background..."
crond -b -L /var/log/cron.log

echo "Cron started. Container will now tail the cron log to stay alive and display output."

# Use tail -f to keep the container running in the foreground and
# stream the cron log to the container's stdout for easy debugging.
touch /var/log/cron.log
tail -f /var/log/cron.log