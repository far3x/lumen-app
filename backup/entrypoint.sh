#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Configuring cron environment..."

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
# This is a robust way to keep a cron-based container alive.
touch /var/log/cron.log
tail -f /var/log/cron.log