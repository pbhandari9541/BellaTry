#!/bin/bash

# Exit on error
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

# Activate virtual environment
source "$BACKEND_DIR/venv/bin/activate"

# Check if venv is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "Error: Virtual environment not activated. Please create and activate venv first."
    exit 1
fi

# Install requirements if needed
if [[ "$CI" != "true" ]]; then  # Skip if running in CI
    pip install -r "$BACKEND_DIR/requirements.txt"
fi

# Run migrations
python "$SCRIPT_DIR/run_migrations.py"

# Deactivate virtual environment
deactivate 