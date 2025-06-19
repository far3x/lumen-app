#!/usr/bin/env bash
# exit on error
set -o errexit

# --- CACHING & ENVIRONMENT SETUP ---
# Create persistent directories for caches to speed up subsequent builds.
# This is the fix for the 15-minute re-compilation of Rust code.
export CARGO_TARGET_DIR=/opt/render/rust-target
export CARGO_HOME=/opt/render/.cargo
export PIP_CACHE_DIR=/opt/render/.pip

mkdir -p $CARGO_TARGET_DIR
mkdir -p $CARGO_HOME
mkdir -p $PIP_CACHE_DIR

# --- BUILD STEPS ---

echo "--- Installing Python Dependencies using Python 3.11 ---"
# Explicitly use the python3.11 executable to install packages.
# This prevents Render from defaulting to a newer, incompatible version.
# This is the fix for the PyO3/tiktoken build error.
python3.11 -m pip install -r requirements.txt

echo "--- Running Database Migrations ---"
alembic upgrade head

echo "--- Build Complete ---"