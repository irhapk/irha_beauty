# Tasks: 009-email-notifications

**Feature**: Transactional Email Notifications via Resend
**Version**: v1.0.0
**Date**: 2026-03-03
**Spec**: specs/009-email-notifications/spec.md
**Plan**: specs/009-email-notifications/plan.md

---

## Task List

### T001 — Install Resend SDK
**File**: `backend/requirements.txt`
**Action**: Add `resend` to requirements.txt

```
resend
```

Run: `cd backend && .venv312/Scripts/pip install resend`

**Acceptance**:
- [x] `import resend` works in the venv
- [x] `resend` appears in `requirements.txt`

---

### T002 — Add Config Variables
**Files**: `backend/app/core/config.py`, `backend/.env.example`, `backend/.env`

Add to `Settings` class in `config.py`:
```python
RESEND_API_KEY: str = ""
EMAIL_FROM: str = "noreply@irhapk.com"
```

Add to `.env.example`:
```
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@irhapk.com
```

Add to `.env` (real values — do not commit):
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@irhapk.com
```

**Acceptance**:
- [x] `settings.RESEND_API_KEY` and `settings.EMAIL_FROM` accessible
- [x] `.env.example` updated with placeholder values
- [ ] `.env` has real key (not committed — user adds after getting Resend API key)

---

### T003 — Create `app/core/email.py`
**File**: `backend/app/core/email.py` (NEW)

Implement all email functions as designed in `plan.md` Section 3:
- `_html_wrapper(body_html)` — branded HTML shell
- `_send(*, to, subject, html, text)` — core send, never raises
- `send_admin_order_notification(order)` — FR-001
- `send_customer_order_confirmation(order)` — FR-002
- `send_order_status_update(order)` — FR-003 (skips `pending`)

**Acceptance**:
- [x] Module importable: `from app.core import email as email_service`
- [x] `_send` catches all exceptions and logs without re-raising
- [x] `send_order_status_update` returns immediately when `order.status == "pending"`
- [x] `_send` logs warning and returns early when `RESEND_API_KEY` is empty (safe for test env)

---

### T004 — Update `app/orders/service.py`
**File**: `backend/app/orders/service.py`

1. Import email module at top:
   ```python
   from app.core import email as email_service
   ```

2. In `create_order`, after `order = await repository.create_order(...)`:
   ```python
   await email_service.send_admin_order_notification(order)
   await email_service.send_customer_order_confirmation(order)
   ```

3. In `update_order_status`, after successful repository call:
   ```python
   await email_service.send_order_status_update(order)
   ```

**Acceptance**:
- [x] Creating an order calls both email functions
- [x] Updating order status calls status update email function
- [x] If email function raises (forced in test), order operation still succeeds

---

### T005 — Update Order Tests to Mock Emails
**File**: `backend/app/orders/tests/test_orders.py`

Add mock patches to all tests that call `POST /api/v1/orders` or `PUT /api/v1/orders/{id}/status`
so they don't attempt real Resend calls:

```python
from unittest.mock import AsyncMock, patch

# Patch both email functions for create order tests
@pytest.mark.asyncio
async def test_create_order_...(async_client, ...):
    with patch("app.orders.service.email_service.send_admin_order_notification", new_callable=AsyncMock), \
         patch("app.orders.service.email_service.send_customer_order_confirmation", new_callable=AsyncMock):
        response = await async_client.post(...)
        ...

# Patch status update email for status update tests
@pytest.mark.asyncio
async def test_update_order_status_...(async_client, ...):
    with patch("app.orders.service.email_service.send_order_status_update", new_callable=AsyncMock):
        response = await async_client.put(...)
        ...
```

**Acceptance**:
- [x] All 55 tests pass: `.venv312/Scripts/pytest --tb=short -q` → 55/55 green
- [x] No test attempts a real HTTP call to Resend
- [x] `test_create_order_sends_both_emails` verifies admin + customer emails called on creation
- [x] `test_update_order_status_sends_email` verifies status update email called on status change

---

### T006 — DNS Verification on Namecheap (User Action)
**This task requires the user — Claude cannot do this.**

1. Sign up / log in at [resend.com](https://resend.com)
2. Go to **Domains** → **Add Domain** → enter `irhapk.com`
3. Resend shows 3 DNS records (SPF, DKIM, DMARC)
4. Log into **Namecheap** → Domains → irhapk.com → **Advanced DNS**
5. Add each record exactly as Resend specifies
6. Back in Resend, click **Verify DNS Records**
7. Status shows green ✅ — domain verified
8. Go to **API Keys** → **Create API Key** → copy the key (starts with `re_`)
9. Add key to `backend/.env` as `RESEND_API_KEY=re_...`

**Acceptance**:
- [ ] Resend domain status for `irhapk.com` = Verified
- [ ] `RESEND_API_KEY` added to `backend/.env`
- [ ] `RESEND_API_KEY` added to Railway environment variables

---

### T007 — Add Railway Environment Variables (User Action)
**This task requires the user — Claude cannot do this.**

1. Go to Railway → your backend service → **Variables**
2. Add:
   - `RESEND_API_KEY` = `re_...` (from Resend dashboard)
   - `EMAIL_FROM` = `noreply@irhapk.com`
3. Railway auto-redeploys

**Acceptance**:
- [ ] Railway service shows both variables set
- [ ] Backend redeploys successfully

---

### T008 — End-to-End Smoke Test
Place a real test order on the live site and verify:

**Acceptance**:
- [ ] Admin receives email at `info.irhapk0@gmail.com` within 60 seconds
- [ ] Customer receives confirmation email at provided address within 60 seconds
- [ ] Update order status in admin dashboard → customer receives status email
- [ ] Both emails render correctly (no broken HTML, correct amounts)

---

### T009 — Commit and Push
**Acceptance**:
- [ ] `cd backend && .venv312/Scripts/pytest --tb=short -q` → 49/49 green
- [ ] Commit message: `feat: transactional email via Resend (009)`
- [ ] Pushed to `005-admin-dashboard` and `002-db-connection`
- [ ] Create PHR for this feature

---

## Dependency Order

```
T001 → T002 → T003 → T004 → T005 → T009
                              ↕
                         T006 → T007 → T008
```

T001–T005 + T009 = Claude implements
T006–T008 = User action (DNS + Railway + smoke test)
