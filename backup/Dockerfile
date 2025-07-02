# Use a lightweight Alpine Linux base image
FROM alpine:3.18

# Install necessary packages:
# - postgresql-client: for pg_dump
# - aws-cli: for interacting with AWS S3
# - dcron: a simple cron daemon for Alpine
# - gzip: for compressing the backup
RUN apk add --no-cache postgresql-client aws-cli dcron gzip

# Create a directory for our application files
WORKDIR /app

# Copy the backup script, crontab, and entrypoint script into the container
COPY backup.sh .
COPY crontab .
COPY entrypoint.sh .

# Make the scripts executable
RUN chmod +x backup.sh entrypoint.sh

# Set the entrypoint to our custom script. This will now be the only
# command that runs, and it will stay alive.
ENTRYPOINT ["/app/entrypoint.sh"]