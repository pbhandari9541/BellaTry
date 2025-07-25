import os
import jwt
from fastapi import Request, HTTPException, status, Depends
from typing import Dict, Any

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

class User:
    def __init__(self, user_id: str, claims: Dict[str, Any]):
        self.id = user_id
        self.claims = claims

def verify_jwt_token(token: str) -> User:
    print("Raw token received:", repr(token))
    print("Secret used:", repr(os.getenv("SUPABASE_JWT_SECRET")))
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(status_code=500, detail="Supabase JWT secret not configured.")
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        print("JWT payload:", payload)
        user_id = payload.get("sub")
        if not user_id:
            print("No user_id in token")
            raise HTTPException(status_code=401, detail="Invalid token: no user ID.")
        return User(user_id, payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired.")
    except Exception as e:
        print("JWT verification error:", str(e))
        raise HTTPException(status_code=401, detail="Invalid token.")

def get_current_user(request: Request) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header.")
    token = auth_header.split(" ", 1)[1]
    user = verify_jwt_token(token)
    # Set user_id on request.state for rate limiting
    request.state.user_id = user.id
    return user 