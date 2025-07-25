"""
Simple in-memory cache service for /ai/analyze and other use cases.
See: PLANNING.md Phase 4. Replace with Redis or distributed cache for production.
"""
import time
from threading import Lock

class CacheService:
    def __init__(self):
        self._store = {}
        self._lock = Lock()

    def get(self, key):
        with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            value, expiry = entry
            if expiry is not None and time.time() > expiry:
                del self._store[key]
                return None
            return value

    def set(self, key, value, ttl=None):
        expiry = time.time() + ttl if ttl else None
        with self._lock:
            self._store[key] = (value, expiry) 