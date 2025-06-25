FROM python:3.11-slim as builder

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y curl tar gzip

RUN curl -L "https://github.com/boyter/scc/releases/download/v3.5.0/scc_Linux_x86_64.tar.gz" -o scc.tar.gz && \
    tar -xzf scc.tar.gz && \
    mv scc /usr/local/bin/scc && \
    rm scc.tar.gz

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .

RUN pip install -r requirements.txt


FROM python:3.11-slim

WORKDIR /usr/src/app

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /usr/local/bin/scc /usr/local/bin/scc

ENV PATH="/opt/venv/bin:$PATH"

COPY . .

EXPOSE 8000

RUN addgroup --system app && adduser --system --group app

USER app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]