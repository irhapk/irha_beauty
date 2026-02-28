# Quickstart: Backend CRUD APIs — Phase 1

**Date**: 2026-02-28

---

## Prerequisites

- Python 3.12+
- pip

---

## Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment
python -m venv .venv

# 3. Activate it
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt
```

---

## requirements.txt (Phase 1)

```text
fastapi
uvicorn[standard]
pydantic[email]
httpx
pytest
pytest-asyncio
```

---

## Run the Server

```bash
# From the backend/ directory
uvicorn app.main:app --reload
```

Server runs at: `http://localhost:8000`
Interactive API docs: `http://localhost:8000/docs`

---

## Run the Tests

```bash
# From the backend/ directory
pytest
```

To run tests for a specific domain:

```bash
pytest app/products/tests/
pytest app/categories/tests/
pytest app/users/tests/
```

---

## API Base URL

All endpoints are prefixed with `/api/v1/`:

| Resource | Base Path |
|---|---|
| Products | `/api/v1/products` |
| Categories | `/api/v1/categories` |
| Users | `/api/v1/users` |

---

## Example: Create a Category then a Product

```bash
# 1. Create a category
curl -X POST http://localhost:8000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Skincare", "description": "Face care products"}'

# 2. Create a product in that category
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Vitamin C Serum", "price": 29.99, "stock": 100, "category_id": 1}'

# 3. List all products
curl http://localhost:8000/api/v1/products
```

---

## Notes

- Data is in-memory. Restarting the server clears all data.
- Tests automatically reset the in-memory store between runs via fixtures.
- No `.env` or secrets needed for Phase 1.
