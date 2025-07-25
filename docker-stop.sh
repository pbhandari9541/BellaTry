#!/bin/bash

# Stop and remove containers, networks, and volumes
echo "Stopping TradeAdvisor containers..."
docker compose -f docker-compose.dev.yml down --remove-orphans

# Remove any dangling Docker images
echo "Cleaning up any dangling Docker images..."
docker image prune -f

# Remove any stopped containers (optional, robust)
docker container prune -f

# Remove unused networks (optional, robust)
docker network prune -f 