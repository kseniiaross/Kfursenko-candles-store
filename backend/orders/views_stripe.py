# backend/orders/views_stripe.py

from decimal import Decimal, ROUND_HALF_UP

import stripe
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Order


stripe.api_key = settings.STRIPE_SECRET_KEY

CENTS = Decimal("100")
USD = "usd"


def _to_cents(amount: Decimal) -> int:
    if amount is None:
        return 0
    q = amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return int((q * CENTS).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def _safe_str(v) -> str:
    return v.strip() if isinstance(v, str) else ""


def _safe_country(v) -> str:
    s = _safe_str(v).upper()
    if s in ("USA", "UNITED STATES", "UNITED STATES OF AMERICA"):
        return "US"
    if len(s) == 2:
        return s
    return "US"


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_payment_intent(request):
    order_id = request.data.get("order_id")
    if not order_id:
        return Response({"detail": "order_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = (
            Order.objects.select_for_update()
            .prefetch_related("items")
            .get(id=order_id, user=request.user)
        )
    except Order.DoesNotExist:
        return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    if order.status != Order.STATUS_PENDING:
        return Response({"detail": "Order is not pending."}, status=status.HTTP_400_BAD_REQUEST)

    full_name = _safe_str(request.data.get("full_name"))
    address = request.data.get("address") or {}
    if not isinstance(address, dict):
        return Response({"detail": "address must be an object."}, status=status.HTTP_400_BAD_REQUEST)

    line1 = _safe_str(address.get("line1"))
    line2 = _safe_str(address.get("line2"))
    city = _safe_str(address.get("city"))
    state = _safe_str(address.get("state"))
    postal_code = _safe_str(address.get("postal_code"))
    country = _safe_country(address.get("country"))

    if not (line1 and city and state and postal_code and country):
        return Response(
            {"detail": "Shipping address is incomplete."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    items = list(order.items.all())
    if not items:
        return Response({"detail": "Order has no items."}, status=status.HTTP_400_BAD_REQUEST)

    currency = (order.currency or USD).lower()

    stripe_line_items = []
    subtotal = Decimal("0.00")
    for it in items:
        unit = Decimal(it.unit_price or Decimal("0.00"))
        qty = int(it.quantity or 0)
        if qty <= 0:
            continue
        subtotal += unit * Decimal(qty)
        stripe_line_items.append(
            {
                "amount": _to_cents(unit),
                "quantity": qty,
                "reference": str(it.id),
                "tax_behavior": "exclusive",
                "product_name": (it.product_name or "")[:200] or "Item",
            }
        )

    if not stripe_line_items or subtotal <= 0:
        return Response({"detail": "Invalid order amount."}, status=status.HTTP_400_BAD_REQUEST)

    shipping_amount = Decimal(str(request.data.get("shipping_amount") or "0.00"))
    if shipping_amount < 0:
        shipping_amount = Decimal("0.00")

    calc = stripe.tax.Calculation.create(
        currency=currency,
        line_items=stripe_line_items,
        customer_details={
            "address": {
                "line1": line1,
                "line2": line2 or None,
                "city": city,
                "state": state,
                "postal_code": postal_code,
                "country": country,
            }
        },
        shipping_cost={"amount": _to_cents(shipping_amount)} if shipping_amount > 0 else None,
    )

    amount_total_cents = int(calc["amount_total"])
    amount_tax_cents = int(calc.get("amount_tax") or 0)

    tax_amount = (Decimal(amount_tax_cents) / CENTS).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total_amount = (Decimal(amount_total_cents) / CENTS).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    intent = stripe.PaymentIntent.create(
        amount=amount_total_cents,
        currency=currency,
        automatic_payment_methods={"enabled": True},
        metadata={
            "order_id": str(order.id),
            "user_id": str(request.user.id),
            "tax_calculation_id": str(calc["id"]),
        },
        shipping={
            "name": full_name or request.user.get_username(),
            "address": {
                "line1": line1,
                "line2": line2 or None,
                "city": city,
                "state": state,
                "postal_code": postal_code,
                "country": country,
            },
        },
    )

    order.shipping_full_name = full_name
    order.shipping_line1 = line1
    order.shipping_line2 = line2
    order.shipping_city = city
    order.shipping_state = state
    order.shipping_postal_code = postal_code
    order.shipping_country = country

    order.subtotal_amount = subtotal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    order.shipping_amount = shipping_amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    order.tax_amount = tax_amount
    order.total_amount = total_amount

    order.stripe_tax_calculation_id = str(calc["id"])
    order.stripe_payment_intent_id = str(intent["id"])
    order.save(
        update_fields=[
            "shipping_full_name",
            "shipping_line1",
            "shipping_line2",
            "shipping_city",
            "shipping_state",
            "shipping_postal_code",
            "shipping_country",
            "subtotal_amount",
            "shipping_amount",
            "tax_amount",
            "total_amount",
            "stripe_tax_calculation_id",
            "stripe_payment_intent_id",
        ]
    )

    return Response(
        {
            "client_secret": intent["client_secret"],
            "order_id": order.id,
            "subtotal": str(order.subtotal_amount),
            "shipping": str(order.shipping_amount),
            "tax": str(order.tax_amount),
            "total": str(order.total_amount),
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        return HttpResponse("Invalid payload", status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse("Invalid signature", status=400)

    event_type = event.get("type", "")
    data_object = (event.get("data") or {}).get("object") or {}

    if event_type == "payment_intent.succeeded":
        intent_id = data_object.get("id", "")
        meta = data_object.get("metadata") or {}
        order_id = meta.get("order_id")

        if order_id and intent_id:
            Order.objects.filter(id=order_id, stripe_payment_intent_id=intent_id).update(
                status=Order.STATUS_PAID
            )

    if event_type == "payment_intent.payment_failed":
        intent_id = data_object.get("id", "")
        meta = data_object.get("metadata") or {}
        order_id = meta.get("order_id")

        if order_id and intent_id:
            Order.objects.filter(id=order_id, stripe_payment_intent_id=intent_id).update(
                status=Order.STATUS_FAILED
            )

    return HttpResponse("OK", status=200)