
#!/bin/bash

# Docker cleanup script for TradeAdvisor
# Use this when you encounter Docker storage corruption or space issues

echo "🧹 Docker Cleanup Script for TradeAdvisor"
echo "========================================"
echo ""
echo "This script will clean up Docker system to resolve storage issues."
echo "WARNING: This will remove ALL Docker images, containers, and volumes!"
echo ""

# Ask for confirmation
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 1
fi

echo ""
echo "🔄 Starting Docker cleanup..."

# Stop all running containers
echo "📦 Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null || true

# Remove all containers
echo "🗑️  Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || true

# Remove all images
echo "🖼️  Removing all images..."
docker rmi $(docker images -aq) 2>/dev/null || true

# Full system prune with volumes
echo "🧽 Running full system prune..."
docker system prune -a --volumes -f

echo ""
echo "✅ Docker cleanup completed!"
echo ""
echo "💡 Next steps:"
echo "1. Run './docker-start.sh' to rebuild and start services"
echo "2. The first run will take longer as it rebuilds all images"
echo ""
echo "📊 Cleanup summary:"
docker system df 