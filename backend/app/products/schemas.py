from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    stock: int
    category_id: int

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be empty or whitespace")
        if len(v) > 200:
            raise ValueError("name must be 200 characters or fewer")
        return v

    @field_validator("description")
    @classmethod
    def description_max_length(cls, v: str) -> str:
        if len(v) > 2000:
            raise ValueError("description must be 2000 characters or fewer")
        return v

    @field_validator("price")
    @classmethod
    def price_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("price must be >= 0")
        return v

    @field_validator("stock")
    @classmethod
    def stock_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("stock must be >= 0")
        return v


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stock: int | None = None
    category_id: int | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str | None) -> str | None:
        if v is not None:
            if not v.strip():
                raise ValueError("name must not be empty or whitespace")
            if len(v) > 200:
                raise ValueError("name must be 200 characters or fewer")
        return v

    @field_validator("price")
    @classmethod
    def price_non_negative(cls, v: float | None) -> float | None:
        if v is not None and v < 0:
            raise ValueError("price must be >= 0")
        return v

    @field_validator("stock")
    @classmethod
    def stock_non_negative(cls, v: int | None) -> int | None:
        if v is not None and v < 0:
            raise ValueError("stock must be >= 0")
        return v


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    price: float
    stock: int
    category_id: int
    created_at: datetime
