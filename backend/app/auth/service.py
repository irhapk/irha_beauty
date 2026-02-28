from fastapi import Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import LoginRequest, RegisterRequest, UserRead
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.users import repository as users_repo


def _set_cookie(response: Response, key: str, value: str, max_age: int) -> None:
    response.set_cookie(
        key=key,
        value=value,
        httponly=True,
        samesite="lax",
        secure=(settings.ENVIRONMENT == "prod"),
        max_age=max_age,
        path="/",
    )


def _set_auth_cookies(response: Response, user_id: int) -> None:
    _set_cookie(
        response,
        "access_token",
        create_access_token(user_id),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    _set_cookie(
        response,
        "refresh_token",
        create_refresh_token(user_id),
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )


def _set_access_cookie(response: Response, user_id: int) -> None:
    _set_cookie(
        response,
        "access_token",
        create_access_token(user_id),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


async def register(
    db: AsyncSession, data: RegisterRequest, response: Response
) -> UserRead:
    existing = await users_repo.get_user_by_email(db, str(data.email))
    if existing is not None:
        raise AppException(
            detail="A user with this email already exists",
            code="EMAIL_ALREADY_EXISTS",
            status_code=409,
        )
    hashed = hash_password(data.password)
    user = await users_repo.create_user_with_password(
        db, data.full_name, str(data.email), hashed
    )
    _set_auth_cookies(response, user.id)
    return UserRead.model_validate(user)


async def login(
    db: AsyncSession, data: LoginRequest, response: Response
) -> UserRead:
    user = await users_repo.get_user_by_email(db, str(data.email))
    # Always call verify_password to prevent timing-based email enumeration
    _DUMMY_HASH = "$2b$12$JYZMzhshsDUquyqOLy8p..xNJYEsLokdNwKjTrmDXR.qPF/P1Mx8i"
    hashed = user.hashed_password if user and user.hashed_password else _DUMMY_HASH
    valid = verify_password(data.password, hashed)
    if user is None or not valid:
        raise AppException(
            detail="Invalid credentials",
            code="INVALID_CREDENTIALS",
            status_code=401,
        )
    _set_auth_cookies(response, user.id)
    return UserRead.model_validate(user)


def logout(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


async def refresh(
    db: AsyncSession, request: Request, response: Response
) -> UserRead:
    token = request.cookies.get("refresh_token")
    if not token:
        raise AppException(
            detail="Invalid refresh token",
            code="INVALID_REFRESH_TOKEN",
            status_code=401,
        )
    try:
        from app.core.security import decode_refresh_token
        payload = decode_refresh_token(token)
        user_id = int(payload["sub"])
    except Exception:
        raise AppException(
            detail="Invalid refresh token",
            code="INVALID_REFRESH_TOKEN",
            status_code=401,
        )
    user = await users_repo.get_user(db, user_id)
    if user is None:
        raise AppException(
            detail="Invalid refresh token",
            code="INVALID_REFRESH_TOKEN",
            status_code=401,
        )
    _set_access_cookie(response, user.id)
    return UserRead.model_validate(user)
