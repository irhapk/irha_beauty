import asyncio
import logging

import resend

from app.core.config import settings

logger = logging.getLogger(__name__)


def _html_wrapper(body_html: str) -> str:
    """Wrap content in branded Irha Beauty email shell."""
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e5e5;">
      <div style="background:#000000;padding:24px;text-align:center;">
        <h1 style="color:#ca9236;font-size:24px;margin:0;letter-spacing:2px;">IRHA BEAUTY</h1>
      </div>
      <div style="background:#ffffff;padding:32px;">
        {body_html}
      </div>
      <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#999999;">
        Irha Beauty &nbsp;&bull;&nbsp; info.irhapk0@gmail.com &nbsp;&bull;&nbsp; +92-312-100-7112
      </div>
    </div>
    """


async def _send(*, to: str, subject: str, html: str, text: str) -> None:
    """Fire-and-forget email send. Logs errors but never raises."""
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
        logger.info("Email sent to %s | subject: %s", to, subject)
    except Exception as exc:
        logger.error("Email send failed to %s: %s", to, exc)


async def send_admin_order_notification(order) -> None:  # type: ignore[type-arg]
    """FR-001 — Notify admin when a new order is placed."""
    items_rows = "".join(
        f"<tr>"
        f"<td style='padding:8px;border-bottom:1px solid #f0f0f0;'>{item.product_name}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #f0f0f0;text-align:center;'>×{item.quantity}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;'>"
        f"Rs {item.unit_price * item.quantity:,.0f}</td>"
        f"</tr>"
        for item in order.items
    )
    body = f"""
    <h2 style="color:#000000;margin-top:0;">New Order #{order.id}</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <tr><td style="padding:4px 0;color:#666;width:120px;">Customer</td>
          <td style="padding:4px 0;"><strong>{order.customer_name}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#666;">Email</td>
          <td style="padding:4px 0;">{order.email}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Phone</td>
          <td style="padding:4px 0;">{order.phone}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Address</td>
          <td style="padding:4px 0;">{order.address}, {order.city}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Payment</td>
          <td style="padding:4px 0;">{order.payment_method.upper()}</td></tr>
    </table>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f5f5f5;">
        <th style="text-align:left;padding:8px;">Product</th>
        <th style="text-align:center;padding:8px;">Qty</th>
        <th style="text-align:right;padding:8px;">Amount</th>
      </tr>
      {items_rows}
    </table>
    <p style="font-size:18px;font-weight:bold;text-align:right;border-top:2px solid #ca9236;
              padding-top:12px;color:#000000;">
      Total: Rs {order.total_amount:,.0f}
    </p>
    """
    plain = (
        f"New Order #{order.id}\n"
        f"Customer: {order.customer_name} | {order.email} | {order.phone}\n"
        f"Address: {order.address}, {order.city}\n"
        f"Payment: {order.payment_method.upper()}\n"
        f"Total: Rs {order.total_amount:,.0f}"
    )
    await _send(
        to=settings.ADMIN_EMAIL,
        subject=f"New Order #{order.id} — {order.customer_name} — Rs {order.total_amount:,.0f}",
        html=_html_wrapper(body),
        text=plain,
    )


async def send_customer_order_confirmation(order) -> None:  # type: ignore[type-arg]
    """FR-002 — Send order confirmation to the customer."""
    items_rows = "".join(
        f"<tr>"
        f"<td style='padding:8px;border-bottom:1px solid #f0f0f0;'>{item.product_name}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #f0f0f0;text-align:center;'>×{item.quantity}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;'>"
        f"Rs {item.unit_price * item.quantity:,.0f}</td>"
        f"</tr>"
        for item in order.items
    )
    body = f"""
    <h2 style="color:#000000;margin-top:0;">Thank you, {order.customer_name}!</h2>
    <p style="color:#555555;">Your order has been placed successfully.
    We&rsquo;ll get it ready for you soon.</p>
    <p><strong>Order ID:</strong> #{order.id}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f5f5f5;">
        <th style="text-align:left;padding:8px;">Product</th>
        <th style="text-align:center;padding:8px;">Qty</th>
        <th style="text-align:right;padding:8px;">Amount</th>
      </tr>
      {items_rows}
    </table>
    <p style="font-size:18px;font-weight:bold;text-align:right;border-top:2px solid #ca9236;
              padding-top:12px;color:#000000;">
      Total: Rs {order.total_amount:,.0f}
    </p>
    <p style="color:#666666;font-size:13px;">
      Estimated delivery: <strong>3&ndash;5 business days</strong>
    </p>
    <p style="color:#666666;font-size:13px;">
      Questions? Contact us:<br>
      <a href="mailto:info.irhapk0@gmail.com"
         style="color:#ca9236;">info.irhapk0@gmail.com</a>
      &nbsp;&bull;&nbsp; +92-312-100-7112
    </p>
    """
    plain = (
        f"Thank you {order.customer_name}!\n"
        f"Order #{order.id} confirmed.\n"
        f"Total: Rs {order.total_amount:,.0f}\n"
        f"Estimated delivery: 3-5 business days.\n"
        f"Contact: info.irhapk0@gmail.com | +92-312-100-7112"
    )
    await _send(
        to=order.email,
        subject=f"Order Confirmed — Irha Beauty #{order.id}",
        html=_html_wrapper(body),
        text=plain,
    )


_STATUS_COPY: dict[str, tuple[str, str]] = {
    "processing": (
        "Your Order Is Being Processed",
        "Great news! We&rsquo;ve started preparing your order and it will be on its way soon.",
    ),
    "delivered": (
        "Your Order Has Been Delivered",
        "Your order has been delivered. We hope you love it! "
        "Feel free to reach out if you have any questions.",
    ),
    "cancelled": (
        "Your Order Has Been Cancelled",
        "Your order has been cancelled. If you have any questions or this was unexpected, "
        "please contact us.",
    ),
}


async def send_order_status_update(order) -> None:  # type: ignore[type-arg]
    """FR-003 — Notify customer of a status change. Skips 'pending' (initial state)."""
    if order.status not in _STATUS_COPY:
        return
    title, message = _STATUS_COPY[order.status]
    body = f"""
    <h2 style="color:#000000;margin-top:0;">{title}</h2>
    <p style="color:#555555;">Hi {order.customer_name},</p>
    <p style="color:#555555;">{message}</p>
    <p><strong>Order ID:</strong> #{order.id}</p>
    <p style="color:#666666;font-size:13px;">
      Questions? Contact us:<br>
      <a href="mailto:info.irhapk0@gmail.com"
         style="color:#ca9236;">info.irhapk0@gmail.com</a>
      &nbsp;&bull;&nbsp; +92-312-100-7112
    </p>
    """
    plain = (
        f"{title}\n"
        f"Hi {order.customer_name}, Order #{order.id}\n"
        f"{message}\n"
        f"Contact: info.irhapk0@gmail.com | +92-312-100-7112"
    )
    await _send(
        to=order.email,
        subject=f"Your Order #{order.id} — {title} — Irha Beauty",
        html=_html_wrapper(body),
        text=plain,
    )
