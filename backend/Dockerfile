FROM python:3.11-slim as builder

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y curl tar gzip git

RUN curl -L "https://github.com/boyter/scc/releases/download/v3.5.0/scc_Linux_x86_64.tar.gz" -o scc.tar.gz && \
    tar -xzf scc.tar.gz && \
    mv scc /usr/local/bin/scc && \
    rm scc.tar.gz

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY ./python-sdk /usr/src/app/python-sdk
RUN pip install /usr/src/app/python-sdk


FROM python:3.11-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y curl git && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /usr/local/bin/scc /usr/local/bin/scc
COPY --from=builder /usr/src/app/python-sdk /usr/src/app/python-sdk

ENV PATH="/opt/venv/bin:$PATH"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]