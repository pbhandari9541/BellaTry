#!/bin/bash

# TradeAdvisor Docker Start Script
# 
# If you encounter Docker storage corruption errors like:
# "failed to prepare extraction snapshot" or "no such file or directory"
# Run './docker-cleanup.sh' first, then run this script again.
#
# Environment variables
export PORT=${PORT:-8080}
export ENVIRONMENT=${ENVIRONMENT:-development}
export NODE_ENV=development  # Use development for local Docker runs
export COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.dev.yml}
export DISABLE_RATE_LIMIT=${DISABLE_RATE_LIMIT:-1}

# Function to run a docker compose command and check its status
run_compose_command() {
    local service=$1
    local command=$2
    echo "Running $command on $service..."
    docker compose -f $COMPOSE_FILE run --rm -e NODE_ENV=$NODE_ENV $service $command
    if [ $? -ne 0 ]; then
        echo "$service $command failed!"
        exit 1
    fi
}

# Function to cleanup containers
cleanup() {
    echo "Shutting down services..."
    docker compose -f $COMPOSE_FILE down
    exit 0
}

# Setup cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Ensure a clean start
docker compose -f $COMPOSE_FILE down --remove-orphans

# Run tests in Docker containers
echo "Running backend tests..."
run_compose_command backend "python -m pytest"

echo "Running frontend type checking..."
run_compose_command frontend

echo "Running frontend tests..."
docker compose -f $COMPOSE_FILE run --rm -e NODE_ENV=test frontend "npm test -- --watchAll=false"
if [ $? -ne 0 ]; then
    echo "frontend tests failed!"
    exit 1
fi

# Remove any stopped containers to avoid port mapping issues
docker container prune -f

# Build and run using docker compose
echo "Starting services with $COMPOSE_FILE in development mode..."
docker compose -f $COMPOSE_FILE up --build --force-recreate 