# Plan: 009-email-notifications

**Feature**: Transactional Email Notifications via Resend
**Version**: v1.0.0
**Date**: 2026-03-03
**Spec**: specs/009-email-notifications/spec.md
**Constitution compliance**: v4.3.0

---

## 1. Architecture Decisions

### AD-001 — Resend as email provider
**Decision**: Use Resend Python SDK (`resend` package).
**Rationale**: Simple API (one function call), 3,000 free emails/month, excellent deliverability,
no SMTP config needed, async-compatible via `resend.Emails.send()` in a thread pool.
**Alternative rejected**: `aiosmtplib` + Gmail SMTP — throttling risk, spam filter risk,
requires Gmail App Password, brittle for transactional use.

### AD-002 — Email as a service module, not a domain
**Decision**: Email logic lives in `app/core/email.py`, not a separate domain folder.
**Rationale**: Email is a side effect of order operations, not an independent domain. It has no
models, no repository, no routes. Placing it in `core` keeps it reusable across any future domain
(e.g. auth emails later).

### AD-003 — Synchronous Resend SDK call, wrapped in asyncio executor
**Decision**: Call `resend.Emails.send()` (sync) inside `asyncio.to_thread()` to avoid
blocking the async event loop.
**Rationale**: Resend's Python SDK is synchronous. Wrapping in `to_thread` keeps FastAPI's async
event loop unblocked. No need for a background task queue (Celery/ARQ) for this volume.

### AD-004 — Best-effort, fire-and-forget pattern
**Decision**: Email sends are wrapped in `try/except`; errors are logged but not re-raised.
**Rationale**: Email failure should never degrade the checkout experience. Customers can always
contact support for confirmation. An order in the DB is more important than an email.

### AD-005 — HTML emails with inline styles only
**Decision**: Build HTML email bodies with inline CSS (no `<style>` block, no external CSS).
**Rationale**: Many email clients (Gmail, Outlook) strip `<style>` tags. Inline styles guarantee
consistent rendering across all clients.

---

## 2. Files Changed

| File | Change |
|---|---|
| `backend/requirements.txt` | Add `resend` |
| `backend/app/core/config.py` | Add `RESEND_API_KEY: str` and `EMAIL_FROM: str` |
| `backend/.env.example` | Add `RESEND_API_KEY=re_...` and `EMAIL_FROM=noreply@irhapk.com` |
| `backend/app/core/email.py` | **NEW** — 3 send functions |
| `backend/app/orders/service.py` | Call email functions after create + status update |

---

## 3. `app/core/email.py` — Module Design

```python
import asyncio
import logging
import resend
from app.core.config import settings

logger = logging.getLogger(__name__)


def _html_wrapper(body_html: str) -> str:
    """Wraps content in branded email shell."""
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#000;padding:24px;text-align:center;">
        <h1 style="color:#ca9236;font-size:24px;margin:0;">Irha Beauty</h1>
      </div>
      <div style="background:#fff;padding:32px;">
        {body_html}
      </div>
      <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#999;">
        Irha Beauty &nbsp;|&nbsp; info.irhapk0@gmail.com &nbsp;|&nbsp; +92-312-100-7112
      </div>
    </div>
    """


async def _send(*, to: str, subject: str, html: str, text: str) -> None:
    """Fire-and-forget email send. Never raises — logs errors instead."""
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping email to %s", to)
        return
    try:
        resend.api_key = settings.RESEND_API_KEY
        await asyncio.to_thread(
            resend.Emails.send,
            {
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": subject,
                "html": html,
                "text": text,
            },
        )
    except Exception as exc:
        logger.error("Email send failed to %s: %s", to, exc)


async def send_admin_order_notification(order) -> None:
    """Notify admin when a new order is placed."""
    items_html = "".join(
        f"<tr><td>{i.product_name}</td><td>×{i.quantity}</td>"
        f"<td>Rs {i.unit_price * i.quantity:,.0f}</td></tr>"
        for i in order.items
    )
    body = f"""
    <h2 style="color:#000;">New Order #{order.id}</h2>
    <p><strong>Customer:</strong> {order.customer_name}</p>
    <p><strong>Email:</strong> {order.email}</p>
    <p><strong>Phone:</strong> {order.phone}</p>
    <p><strong>Address:</strong> {order.address}, {order.city}</p>
    <p><strong>Payment:</strong> {order.payment_method.upper()}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f5f5f5;">
        <th style="text-align:left;padding:8px;">Product</th>
        <th style="text-align:left;padding:8px;">Qty</th>
        <th style="text-align:left;padding:8px;">Amount</th>
      </tr>
      {items_html}
    </table>
    <p style="font-size:18px;"><strong>Total: Rs {order.total_amount:,.0f}</strong></p>
    """
    plain = (
        f"New Order #{order.id}\n"
        f"Customer: {order.customer_name} | {order.email} | {order.phone}\n"
        f"Address: {order.address}, {order.city}\n"
        f"Total: Rs {order.total_amount:,.0f}"
    )
    await _send(
        to=settings.ADMIN_EMAIL,
        subject=f"New Order #{order.id} — {order.customer_name} — Rs {order.total_amount:,.0f}",
        html=_html_wrapper(body),
        text=plain,
    )


async def send_customer_order_confirmation(order) -> None:
    """Send order confirmation to the customer."""
    items_html = "".join(
        f"<tr><td>{i.product_name}</td><td>×{i.quantity}</td>"
        f"<td>Rs {i.unit_price * i.quantity:,.0f}</td></tr>"
        for i in order.items
    )
    body = f"""
    <h2 style="color:#000;">Thank you, {order.customer_name}!</h2>
    <p>Your order has been placed successfully. We'll get it ready for you soon.</p>
    <p><strong>Order ID:</strong> #{order.id}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f5f5f5;">
        <th style="text-align:left;padding:8px;">Product</th>
        <th style="text-align:left;padding:8px;">Qty</th>
        <th style="text-align:left;padding:8px;">Amount</th>
      </tr>
      {items_html}
    </table>
    <p style="font-size:18px;"><strong>Total: Rs {order.total_amount:,.0f}</strong></p>
    <p style="color:#666;">Estimated delivery: 3–5 business days</p>
    <p>Questions? Reply to this email or contact us:<br>
    <strong>info.irhapk0@gmail.com</strong> | <strong>+92-312-100-7112</strong></p>
    """
    plain = (
        f"Thank you {order.customer_name}! Order #{order.id} confirmed.\n"
        f"Total: Rs {order.total_amount:,.0f}\n"
        f"Estimated delivery: 3–5 business days.\n"
        f"Contact: info.irhapk0@gmail.com | +92-312-100-7112"
    )
    await _send(
        to=order.email,
        subject=f"Order Confirmed — Irha Beauty #{order.id}",
        html=_html_wrapper(body),
        text=plain,
    )


_STATUS_MESSAGES = {
    "processing": (
        "Your Order Is Being Processed",
        "Great news! We've started preparing your order and it will be on its way soon.",
    ),
    "delivered": (
        "Your Order Has Been Delivered",
        "Your order has been delivered. We hope you love it! "
        "Please reach out if you have any questions.",
    ),
    "cancelled": (
        "Your Order Has Been Cancelled",
        "Your order has been cancelled. If you have questions, please contact us.",
    ),
}


async def send_order_status_update(order) -> None:
    """Notify customer of a status change. Skips 'pending' status."""
    if order.status not in _STATUS_MESSAGES:
        return
    title, message = _STATUS_MESSAGES[order.status]
    body = f"""
    <h2 style="color:#000;">{title}</h2>
    <p>Hi {order.customer_name},</p>
    <p>{message}</p>
    <p><strong>Order ID:</strong> #{order.id}</p>
    <p>Questions? Contact us:<br>
    <strong>info.irhapk0@gmail.com</strong> | <strong>+92-312-100-7112</strong></p>
    """
    plain = f"{title}\nOrder #{order.id}\n{message}\nContact: info.irhapk0@gmail.com"
    await _send(
        to=order.email,
        subject=f"Your Order #{order.id} — {title} — Irha Beauty",
        html=_html_wrapper(body),
        text=plain,
    )
```

---

## 4. `app/orders/service.py` — Updated

After `create_order`:
```python
from app.core import email as email_service

async def create_order(...) -> OrderRead:
    ...
    order = await repository.create_order(db, data, current_user.id)
    # Fire-and-forget emails (errors are logged, never raised)
    await email_service.send_admin_order_notification(order)
    await email_service.send_customer_order_confirmation(order)
    return OrderRead.model_validate(order)
```

After `update_order_status`:
```python
async def update_order_status(...) -> OrderRead:
    ...
    order = await repository.update_order_status(db, order_id, status)
    if order is None:
        raise AppException(...)
    await email_service.send_order_status_update(order)
    return OrderRead.model_validate(order)
```

---

## 5. Config Changes

`app/core/config.py` — add:
```python
RESEND_API_KEY: str = ""
EMAIL_FROM: str = "noreply@irhapk.com"
```

`.env.example` — add:
```
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@irhapk.com
```

---

## 6. DNS Setup (User Action Required — One Time)

After getting Resend API key and adding `irhapk.com` as a domain in Resend:

Resend will provide 3 DNS records to add to Namecheap:
1. **SPF** — TXT record on `@` or subdomain
2. **DKIM** — TXT record on a `resend._domainkey` subdomain
3. **DMARC** (optional but recommended) — TXT record on `_dmarc`

Steps:
1. Log into resend.com → Domains → Add Domain → enter `irhapk.com`
2. Copy the 3 DNS records Resend provides
3. Log into Namecheap → Domains → irhapk.com → Advanced DNS → Add Records
4. Click "Verify DNS Records" in Resend dashboard
5. Status turns green — domain is verified, emails can be sent

---

## 7. Test Strategy

- Resend calls are mocked in tests using `unittest.mock.patch`
- Tests verify that email functions are called with correct arguments
- Tests do NOT assert email HTML content (too brittle)
- Existing 49 tests must pass unchanged

```python
# Example mock pattern in test_orders.py
from unittest.mock import AsyncMock, patch

async def test_create_order_sends_emails(async_client, ...):
    with patch("app.orders.service.email_service.send_admin_order_notification", new_callable=AsyncMock) as mock_admin, \
         patch("app.orders.service.email_service.send_customer_order_confirmation", new_callable=AsyncMock) as mock_customer:
        response = await async_client.post("/api/v1/orders", ...)
        assert response.status_code == 201
        mock_admin.assert_called_once()
        mock_customer.assert_called_once()
```

---

## 8. Railway Environment Variables

After implementing, add to Railway service environment:
- `RESEND_API_KEY` = real key from resend.com
- `EMAIL_FROM` = `noreply@irhapk.com`
