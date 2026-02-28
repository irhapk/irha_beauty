from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("full_name must not be empty or whitespace")
        if len(v) > 150:
            raise ValueError("full_name must be 150 characters or fewer")
        return v


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: str | None) -> str | None:
        if v is not None:
            if not v.strip():
                raise ValueError("full_name must not be empty or whitespace")
            if len(v) > 150:
                raise ValueError("full_name must be 150 characters or fewer")
        return v


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    created_at: datetime
