#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Installing Python Dependencies ---"
pip install -r requirements.txt

echo "--- Running Database Migrations ---"
alembic upgrade head

echo "--- Build Complete ---"