#!/usr/bin/env bash
# exit on error
set -o errexit

# --- CACHING & ENVIRONMENT SETUP ---

# Create a persistent directory for the Rust compiler's output.
# This is the key to speeding up builds after the first one.
export CARGO_TARGET_DIR=/opt/render/rust-target

# Set the CARGO_HOME to a persistent directory as well.
export CARGO_HOME=/opt/render/.cargo

# Set the pip cache directory to a persistent location.
export PIP_CACHE_DIR=/opt/render/.pip

# Ensure the paths exist
mkdir -p $CARGO_TARGET_DIR
mkdir -p $CARGO_HOME
mkdir -p $PIP_CACHE_DIR

# --- BUILD STEPS ---

echo "--- Installing Python Dependencies ---"
pip install -r requirements.txt

echo "--- Running Database Migrations ---"
alembic upgrade head

echo "--- Build Complete ---"