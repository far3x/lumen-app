#!/usr/bin/env bash
# exit on error
set -o errexit

# NEW: Force the Rust build tool (cargo) to use a local, writable
# directory for its cache, instead of the read-only system path.
# This is required to build the 'tiktoken' dependency.
export CARGO_HOME=/opt/render/.cargo

echo "--- Installing Python Dependencies ---"
pip install -r requirements.txt

echo "--- Running Database Migrations ---"
alembic upgrade head

echo "--- Build Complete ---"