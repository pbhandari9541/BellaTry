"""
In-memory caching and rate limiting utilities for agent methods.
See: PLANNING.md, Phase 3 - Core Agent Logic, Step 6: Rate Limiting, Caching, and Fallbacks
TODO: Extend to distributed cache/rate limiting for production.
"""
import time
import functools
from typing import Any, Callable, Dict, Tuple
import os
import asyncio

# Simple in-memory cache: {(args, kwargs): (result, expiry)}
_cache_store: Dict[Tuple, Tuple[Any, float]] = {}

# Simple in-memory rate limiter: {key: last_call_time}
_rate_limit_store: Dict[str, float] = {}

def in_memory_cache(ttl: int = 60):
    """
    Decorator to cache function results in memory for `ttl` seconds.
    Args:
        ttl: Time-to-live for cache entries (seconds).
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            key = (func.__name__, str(args), str(kwargs))
            now = time.time()
            if key in _cache_store:
                result, expiry = _cache_store[key]
                if now < expiry:
                    return result
            result = await func(*args, **kwargs)
            _cache_store[key] = (result, now + ttl)
            return result
        return wrapper
    return decorator

def rate_limit(min_interval: float = 5.0):
    """
    Decorator to rate limit function calls to once per `min_interval` seconds.
    Args:
        min_interval: Minimum seconds between calls.
    Notes:
        - Rate limiting is keyed per agent instance (if used as a method), otherwise per function.
        - Set environment variable DISABLE_RATE_LIMIT=1 to disable rate limiting (for tests).
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            if os.environ.get("DISABLE_RATE_LIMIT") == "1":
                return await func(*args, **kwargs)
            # Key by (func name, id(self)) if first arg is a class instance, else just func name
            if args and hasattr(args[0], '__class__'):
                key = (func.__name__, id(args[0]))
            else:
                key = (func.__name__,)
            now = time.time()
            last_call = _rate_limit_store.get(key, 0)
            if now - last_call < min_interval:
                raise Exception(f"Rate limit exceeded: {min_interval}s between calls for {func.__name__}")
            _rate_limit_store[key] = now
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def async_retry(max_attempts: int = 3, backoff: float = 0.5):
    """
    Decorator to retry async functions on exception, with exponential backoff.
    Args:
        max_attempts: Maximum number of attempts (default 3)
        backoff: Initial backoff in seconds (doubles each retry)
    Usage:
        @async_retry(max_attempts=3, backoff=0.5)
        async def my_func(...):
            ...
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            attempt = 0
            delay = backoff
            while attempt < max_attempts:
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    attempt += 1
                    if attempt >= max_attempts:
                        raise
                    # Log retry attempt (if MonitoringService available)
                    print(f"[Retry] {func.__name__}: attempt {attempt} failed with {e}, retrying in {delay:.2f}s...")
                    await asyncio.sleep(delay)
                    delay *= 2
        return wrapper
    return decorator

# TODO: Replace with distributed cache/rate limiting for production use. 