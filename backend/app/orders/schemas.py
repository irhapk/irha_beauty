from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator

OrderStatus = Literal["pending", "processing", "delivered", "cancelled"]


class OrderItemIn(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("quantity must be >= 1")
        return v

    @field_validator("unit_price")
    @classmethod
    def unit_price_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("unit_price must be >= 0")
        return v


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: int
    quantity: int
    unit_price: float


class CreateOrderRequest(BaseModel):
    customer_name: str
    address: str
    city: str
    phone: str
    items: list[OrderItemIn]
    payment_method: Literal["cod"] = "cod"
    total_amount: float

    @field_validator("customer_name")
    @classmethod
    def customer_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("customer_name must not be empty")
        return v.strip()

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list[OrderItemIn]) -> list[OrderItemIn]:
        if not v:
            raise ValueError("order must contain at least one item")
        return v

    @field_validator("total_amount")
    @classmethod
    def total_amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("total_amount must be > 0")
        return v


class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None
    customer_name: str
    address: str
    city: str
    phone: str
    payment_method: str
    total_amount: float
    status: str
    created_at: datetime
    items: list[OrderItemRead]
