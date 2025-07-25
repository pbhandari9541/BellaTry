"""
TODO: Quota/Billing Plan Needed!
- Current rate limiting is not enforced (or is set to a high value).
- In the future, implement robust quota and billing logic to control OpenAI/API costs and ensure business profitability.
- Consider per-user, per-plan, and abuse prevention strategies.
- See planning docs for details.

In-memory rate limiter for FastAPI endpoints, keyed by user ID (authenticated) or IP (unauthenticated).
Returns HTTP 429 if the limit is exceeded. See PLANNING.md Phase 4.
Replace with Redis or distributed rate limiter for production.
"""
import time
import os
from fastapi import Request, HTTPException
from threading import Lock

class RateLimiter:
    def __init__(self):
        # Allow separate intervals for user and IP
        self.user_interval = float(os.getenv("RATE_LIMIT_INTERVAL_USER", os.getenv("RATE_LIMIT_INTERVAL", "0")))
        self.ip_interval = float(os.getenv("RATE_LIMIT_INTERVAL_IP", os.getenv("RATE_LIMIT_INTERVAL", "0")))
        self._store = {}
        self._lock = Lock()

    async def __call__(self, request: Request):
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            key = f"user:{user_id}"
            interval = self.user_interval
        else:
            key = f"ip:{request.client.host}"
            interval = self.ip_interval
        now = time.time()
        with self._lock:
            last_call = self._store.get(key, 0)
            if now - last_call < interval:
                raise HTTPException(status_code=429, detail=f"Rate limit exceeded: {interval}s between requests")
            self._store[key] = now 