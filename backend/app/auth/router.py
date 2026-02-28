from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import service
from app.auth.schemas import LoginRequest, RegisterRequest, UserRead
from app.core.deps import get_current_user, get_db
from app.users.models import User

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=201)
async def register(
    data: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    return await service.register(db, data, response)


@router.post("/login", response_model=UserRead, status_code=200)
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    return await service.login(db, data, response)


@router.post("/logout", status_code=204)
async def logout(response: Response) -> None:
    service.logout(response)


@router.post("/refresh", response_model=UserRead, status_code=200)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    return await service.refresh(db, request, response)


@router.get("/me", response_model=UserRead, status_code=200)
async def me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)
