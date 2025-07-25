from fastapi import APIRouter, Depends
from app.config.supabase import get_supabase_client
import psutil
import time
import logging
import os

router = APIRouter(prefix="/api")
start_time = time.time()
logger = logging.getLogger(__name__)

@router.get("/health")
async def health_check(supabase=Depends(get_supabase_client)):
    """
    Health check endpoint that monitors system and database status
    """
    try:
        # System metrics
        uptime = int(time.time() - start_time)
        memory = psutil.Process().memory_info().rss / (1024 * 1024)  # Convert to MB
        cpu = psutil.cpu_percent()

        # Test Supabase connection by inserting a health record
        result = supabase.table("health") \
            .insert({"status": "OK"}) \
            .execute()
        
        # If we get here, Supabase is working
        return {
            "status": "healthy",
            "service": "TradeAdvisor API",
            "version": "1.0.0",
            "environment": os.getenv("ENV", "development"),
            "uptime": uptime,
            "memory_usage": memory,
            "cpu_usage": cpu,
            "supabase": {
                "status": "UP"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "TradeAdvisor API",
            "version": "1.0.0",
            "environment": os.getenv("ENV", "development"),
            "uptime": uptime,
            "memory_usage": memory,
            "cpu_usage": cpu,
            "supabase": {
                "status": "DOWN",
                "error": str(e)
            }
        } 