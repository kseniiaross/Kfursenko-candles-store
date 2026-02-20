from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.db import transaction

@csrf_exempt
def stripe_webhook(request):
    if request.method != "POST":
        return HttpResponse(status=405)

    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    endpoint_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")
    if not endpoint_secret:
        return HttpResponse("Missing STRIPE_WEBHOOK_SECRET", status=500)

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        return HttpResponse("Invalid payload", status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse("Invalid signature", status=400)

    event_type = event.get("type", "")
    obj = (event.get("data") or {}).get("object") or {}

    if event_type in ("payment_intent.succeeded", "payment_intent.payment_failed"):
        intent_id = (obj.get("id") or "").strip()
        meta = obj.get("metadata") or {}
        order_id = (meta.get("order_id") or "").strip()

        if not (order_id and intent_id):
            return HttpResponse(status=200)

        new_status = (
            Order.Status.PAID
            if event_type == "payment_intent.succeeded"
            else Order.Status.CANCELED
        )

        # ✅ idempotent update + respects transitions (PENDING -> PAID / CANCELED)
        with transaction.atomic():
            qs = (
                Order.objects.select_for_update()
                .filter(
                    id=order_id,
                    stripe_payment_intent_id=intent_id,
                )
            )

            order = qs.first()
            if not order:
                return HttpResponse(status=200)

            # если уже ушли в shipped/completed/refunded — не трогаем
            if order.status in (Order.Status.SHIPPED, Order.Status.COMPLETED, Order.Status.REFUNDED):
                return HttpResponse(status=200)

            if order.status != new_status and order.can_transition(new_status):
                order.status = new_status
                order.save(update_fields=["status", "updated_at"])

    return HttpResponse(status=200)