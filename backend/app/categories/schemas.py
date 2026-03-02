from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class CategoryCreate(BaseModel):
    name: str
    description: str = ""
    slug: str = ""
    status: str = "active"
    banner_image: str = ""
    category_image: str = ""

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be empty or whitespace")
        if len(v) > 100:
            raise ValueError("name must be 100 characters or fewer")
        return v

    @field_validator("description")
    @classmethod
    def description_max_length(cls, v: str) -> str:
        if len(v) > 500:
            raise ValueError("description must be 500 characters or fewer")
        return v


class CategoryUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    slug: str | None = None
    status: str | None = None
    banner_image: str | None = None
    category_image: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str | None) -> str | None:
        if v is not None:
            if not v.strip():
                raise ValueError("name must not be empty or whitespace")
            if len(v) > 100:
                raise ValueError("name must be 100 characters or fewer")
        return v

    @field_validator("description")
    @classmethod
    def description_max_length(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 500:
            raise ValueError("description must be 500 characters or fewer")
        return v


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    slug: str
    status: str
    banner_image: str
    category_image: str
    created_at: datetime
