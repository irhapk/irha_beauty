from typing import AsyncGenerator

import jwt
from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.exceptions import AppException
from app.core.security import decode_access_token


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db)
):
    from app.users import repository as users_repo

    token = request.cookies.get("access_token")
    if not token:
        raise AppException(
            detail="Not authenticated",
            code="NOT_AUTHENTICATED",
            status_code=401,
        )
    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise AppException(
            detail="Token expired",
            code="TOKEN_EXPIRED",
            status_code=401,
        )
    except (jwt.InvalidTokenError, ValueError, KeyError):
        raise AppException(
            detail="Not authenticated",
            code="NOT_AUTHENTICATED",
            status_code=401,
        )
    user = await users_repo.get_user(db, user_id)
    if user is None:
        raise AppException(
            detail="Not authenticated",
            code="NOT_AUTHENTICATED",
            status_code=401,
        )
    return user


async def get_admin_user(
    request: Request, db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    if user.email != settings.ADMIN_EMAIL:
        raise AppException(
            detail="Admin access required",
            code="FORBIDDEN",
            status_code=403,
        )
    return user
