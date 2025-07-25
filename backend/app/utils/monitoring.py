import logging
from typing import Optional

"""
Parent: See PLANNING.md Iteration 3: Yahoo Finance Integration
"""

class MonitoringService:
    def __init__(self):
        self.success_count = 0
        self.failure_count = 0
        self.last_error: Optional[str] = None
        self.logger = logging.getLogger("pipeline.monitoring")

    def log_success(self, message: str):
        self.success_count += 1
        self.logger.info(f"SUCCESS: {message}")

    def log_failure(self, message: str, error: Exception):
        self.failure_count += 1
        self.last_error = str(error)
        self.logger.error(f"FAILURE: {message} | Error: {error}")

    def get_status(self):
        return {
            "success_count": self.success_count,
            "failure_count": self.failure_count,
            "last_error": self.last_error
        }

_monitoring_service = None

def get_monitoring_service():
    """Get the global MonitoringService singleton."""
    global _monitoring_service
    if _monitoring_service is None:
        _monitoring_service = MonitoringService()
    return _monitoring_service 