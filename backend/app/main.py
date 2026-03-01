from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppException, app_exception_handler, http_exception_handler

from app.auth.router import router as auth_router
from app.categories.router import router as categories_router
from app.orders.router import router as orders_router
from app.products.router import router as products_router
from app.users.router import router as users_router

app = FastAPI(title="Irha Beauty API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)

app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(categories_router, prefix="/api/v1/categories", tags=["categories"])
app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(products_router, prefix="/api/v1/products", tags=["products"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
