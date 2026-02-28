# Research: Backend CRUD APIs — Phase 1

**Date**: 2026-02-28
**Feature**: 001-backend-crud-apis

---

## Summary

No NEEDS CLARIFICATION markers exist in the spec or plan. The constitution fully defines the tech stack. This document records the key decisions and their rationale.

---

## Decision 1: FastAPI as the web framework

- **Decision**: FastAPI
- **Rationale**: Mandated in constitution. FastAPI provides automatic OpenAPI docs, native async support, and tight Pydantic v2 integration — ideal for a type-safe CRUD API.
- **Alternatives considered**: Flask (no async native, no Pydantic integration), Django REST (heavier, overkill for Phase 1)

---

## Decision 2: Pydantic v2 for schema validation

- **Decision**: Pydantic v2
- **Rationale**: Mandated in constitution. v2 is significantly faster than v1 and uses `model_config = ConfigDict(from_attributes=True)` for ORM compatibility (needed in Phase 2).
- **Alternatives considered**: Pydantic v1 (slower, deprecated), dataclasses (no validation)

---

## Decision 3: In-memory dict as data store (Phase 1 only)

- **Decision**: Each domain service owns a module-level `dict[int, <Model>]` and an `int` counter for auto-increment IDs.
- **Rationale**: Keeps Phase 1 focused on API contracts and schema design. No DB setup needed. The service layer is the only place that touches storage — making it trivially swappable for a repository in Phase 2.
- **Alternatives considered**: SQLite in-memory (adds DB dependency too early), JSON file (adds I/O complexity)

---

## Decision 4: httpx AsyncClient for tests

- **Decision**: `httpx.AsyncClient` with `ASGITransport(app=app)`
- **Rationale**: Mandated in constitution. Works natively with FastAPI async endpoints. No real HTTP server needed for tests.
- **Alternatives considered**: TestClient (sync only, not suitable for async endpoints), requests (HTTP only)

---

## Decision 5: Error envelope `{ "detail": "...", "code": "SCREAMING_SNAKE" }`

- **Decision**: Custom `HTTPException` handler that wraps all 4xx errors in `{ "detail": "...", "code": "SCREAMING_SNAKE" }`.
- **Rationale**: Mandated in constitution. Gives clients a machine-readable error code and a human-readable message.
- **Alternatives considered**: FastAPI default 422 format (no machine code), plain string messages (not structured)

---

## Decision 6: Auto-increment integer IDs

- **Decision**: IDs are integers, auto-incremented by the service, never supplied by the client. Counter starts at 1.
- **Rationale**: Simple for Phase 1. In Phase 2 this will be replaced by the database's serial/identity column.
- **Alternatives considered**: UUIDs (overkill for Phase 1, harder to test predictably)

---

## No Open Questions

All items resolved. Ready for Phase 1 design.
