# Spec: 009-email-notifications

**Feature**: Transactional Email Notifications via Resend
**Version**: v1.0.0
**Date**: 2026-03-03
**Status**: Approved
**Constitution compliance**: v4.3.0

---

## 1. Goal

Send automated transactional emails when orders are placed or updated, so the admin is always
notified of new business and customers feel confident their order was received and is progressing.

---

## 2. Functional Requirements

### FR-001 — Admin Order Notification
When a new order is successfully created, send an email to the admin (`ADMIN_EMAIL` from config):
- Subject: `New Order #<id> — <customer_name> — Rs <total_amount>`
- Body includes: order ID, customer name, email, phone, city, address, payment method, line items
  (product name × quantity @ unit price), and order total
- Sent from: `noreply@irhapk.com`

### FR-002 — Customer Order Confirmation
When a new order is successfully created, send a confirmation email to the customer's email address:
- Subject: `Order Confirmed — Irha Beauty #<id>`
- Body includes: greeting with customer name, order ID, line items, total, estimated delivery note,
  and contact info (`info.irhapk0@gmail.com` / `+92-312-100-7112`)
- Sent from: `noreply@irhapk.com`

### FR-003 — Customer Status Update
When an order's status is updated to `processing`, `delivered`, or `cancelled`, send an email to
the customer:
- Subject varies by status:
  - `processing` → `Your Order #<id> Is Being Processed — Irha Beauty`
  - `delivered` → `Your Order #<id> Has Been Delivered — Irha Beauty`
  - `cancelled` → `Your Order #<id> Has Been Cancelled — Irha Beauty`
- Body includes: order ID, status message, and contact info for queries
- Sent from: `noreply@irhapk.com`
- **Not sent** when status changes to `pending` (that is the initial state, covered by FR-002)

### FR-004 — Best-Effort Sending
Email failures must **never** cause an order operation to fail:
- All email sends wrapped in `try/except`
- On failure: log the error, continue execution
- Order creation and status updates succeed regardless of email outcome

### FR-005 — Plain-Text + HTML
Each email is sent with both a plain-text fallback and an HTML version.
HTML uses inline styles only (no external CSS) for maximum email client compatibility.
Theme: black background header with gold accent (`#ca9236`), white body.

---

## 3. Non-Functional Requirements

- No new database tables or Alembic migration required
- No new API endpoints — hooks into existing `create_order` and `update_order_status` services
- All 49 existing backend tests must continue to pass
- Resend API calls are mocked in tests — no real emails sent during test runs
- `RESEND_API_KEY` and `EMAIL_FROM` added to `.env` and `.env.example`
- Domain `irhapk.com` must be verified in Resend dashboard (user DNS action required)

---

## 4. Out of Scope

- Password reset emails (deferred)
- Email verification on registration (deferred)
- Marketing / promotional emails (deferred)
- Email open / click tracking (deferred)
- Unsubscribe management (deferred)
- Attachments / PDF invoices (deferred)

---

## 5. User Stories

| ID | As a… | I want… | So that… |
|---|---|---|---|
| US-001 | Admin | Email when an order is placed | I know immediately without checking the dashboard |
| US-002 | Customer | Confirmation email after checkout | I'm confident my order was received |
| US-003 | Customer | Email when my order status changes | I know when it's being packed, shipped, or delivered |

---

## 6. Acceptance Criteria

- [ ] Placing a test order triggers both admin notification and customer confirmation emails
- [ ] Admin email contains all order details (items, total, customer info)
- [ ] Customer confirmation email contains order ID, items, total
- [ ] Changing order status to `delivered` sends customer a delivered notification
- [ ] Changing order status to `cancelled` sends customer a cancellation email
- [ ] Changing order status to `pending` sends no email
- [ ] If Resend throws an exception, order creation still returns `201`
- [ ] `npm run build` (frontend) and pytest (backend) both pass cleanly
- [ ] `RESEND_API_KEY` is never hardcoded — always read from `.env`
