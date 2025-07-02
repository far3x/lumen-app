FROM alpine:3.18

RUN apk add --no-cache postgresql-client aws-cli dcron gzip

WORKDIR /app

COPY backup.sh .
COPY crontab .
COPY entrypoint.sh .

RUN chmod +x backup.sh entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["crond", "-f", "-d", "-L", "/dev/stdout"]