from fastapi import Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.auth.firebase import verify_bearer_token
from app.core.db import get_db


def db_dep() -> AsyncIOMotorDatabase:
    return get_db()


def current_user(request: Request) -> dict:
    auth_header = request.headers.get("authorization") or ""
    if not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = auth_header.split(" ", 1)[1].strip()
    try:
        return verify_bearer_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


CurrentUser = Depends(current_user)
DB = Depends(db_dep)

