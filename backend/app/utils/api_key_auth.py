"""
API key authentication dependency for FastAPI endpoints.
Uses NEXT_PUBLIC_X_API_KEY and X_API_KEY_PRIVATE from the environment for allowed keys.
See: PLANNING.md Phase 4. Swap for DB/env/file in production.
"""
from fastapi import Request, HTTPException, Header
from starlette.status import HTTP_401_UNAUTHORIZED
import os
from typing import Optional

ALLOWED_API_KEYS = set(
    filter(None, [
        os.getenv("NEXT_PUBLIC_X_API_KEY"),
        os.getenv("X_API_KEY_PRIVATE"),
        "test-key-456",  # Test key for development/testing
    ])
)

async def api_key_auth(x_api_key: Optional[str] = Header(None)) -> str:
    """
    Validate API key from X-API-Key header.
    Returns the API key if valid, raises HTTPException if invalid.
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    if x_api_key not in ALLOWED_API_KEYS:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    return x_api_key 