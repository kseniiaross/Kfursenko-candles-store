// src/view/Checkout.tsx

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import api from "../api/axiosInstance";
import "../styles/Checkout.css";

type CartLine = {
  candle_id: number;
  name?: string;
  price?: number;
  image?: string;
  size?: string;
  quantity: number;
};

type ShippingForm = {
  full_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function money(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const SHIPPING = 15;

const Checkout: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  const [tax, setTax] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState<ShippingForm>({
    full_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  const cartItems = useAppSelector((s) => (s.cart.items ?? []) as CartLine[]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  }, [cartItems]);

  const onField =
    (key: keyof ShippingForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
    };

  const canPay =
    cartItems.length > 0 &&
    form.full_name.trim() &&
    form.address_line1.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.postal_code.trim() &&
    form.country.trim();

  const createOrderAndIntent = async () => {
    if (!canPay) return;

    setLoading(true);
    setErrorMsg("");
    setClientSecret("");
    setOrderId(null);
    setTax(null);
    setTotal(null);

    try {
      const orderPayload = {
        items: cartItems.map((it) => ({
          candle_id: it.candle_id,
          quantity: it.quantity,
        })),
        shipping: {
          full_name: form.full_name.trim(),
          address_line1: form.address_line1.trim(),
          address_line2: form.address_line2.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postal_code: form.postal_code.trim(),
          country: form.country.trim().toUpperCase(),
        },
        shipping_amount: SHIPPING,
      };

      const orderRes = await api.post("/orders/", orderPayload);

      const createdId = isRecord(orderRes.data) && typeof orderRes.data.id === "number"
        ? orderRes.data.id
        : null;

      if (!createdId) {
        throw new Error("Order id not returned from backend");
      }

      setOrderId(createdId);

      const intentRes = await api.post("/orders/create-intent/", { order_id: createdId });

      const cs = isRecord(intentRes.data) ? intentRes.data.client_secret : null;
      const taxAmount = isRecord(intentRes.data) ? intentRes.data.tax_amount : null;
      const totalAmount = isRecord(intentRes.data) ? intentRes.data.total_amount : null;

      if (typeof cs !== "string" || !cs) throw new Error("Invalid client_secret");

      setClientSecret(cs);

      if (typeof taxAmount === "number") setTax(taxAmount);
      if (typeof totalAmount === "number") setTotal(totalAmount);
    } catch (e) {
      setErrorMsg("Could not prepare payment. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout">
      <div className="checkout__backWrap">
        <Link to="/cart" className="checkout__backLink">
          Go back to Shopping Cart
        </Link>
      </div>

      <h1 className="checkout__title">PLACE YOUR ORDER</h1>

      <div className="checkout__grid">
        <div className="checkout__summary">
          <h3 className="checkout__sectionTitle">ORDER SUMMARY</h3>

          <div className="checkout__items">
            {cartItems.map((item) => (
              <div key={item.candle_id} className="checkoutItem">
                <img
                  src={item.image ?? "/images/placeholder.jpg"}
                  alt={item.name ?? "Product"}
                  className="checkoutItem__image"
                />

                <div className="checkoutItem__info">
                  <div className="checkoutItem__name">
                    {item.name ?? `Candle #${item.candle_id}`}
                  </div>

                  {item.size && <div className="checkoutItem__size">Size: {item.size}</div>}

                  <div className="checkoutItem__qty">Quantity: {item.quantity}</div>
                </div>

                <div className="checkoutItem__lineTotal">
                  {money((item.price ?? 0) * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="checkout__totals">
            <div className="row">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>

            <div className="row">
              <span>Shipping</span>
              <span>{money(SHIPPING)}</span>
            </div>

            <div className="row">
              <span>Tax</span>
              <span>{tax === null ? "—" : money(tax)}</span>
            </div>

            <div className="row row--total">
              <span>Total</span>
              <span>{total === null ? "—" : money(total)}</span>
            </div>
          </div>

          {orderId !== null && (
            <div className="checkout__state">
              Order #{orderId} created
            </div>
          )}

          {clientSecret && (
            <div className="checkout__state">
              Payment prepared (client_secret received)
            </div>
          )}

          {errorMsg && (
            <div className="checkout__state checkout__state--error">{errorMsg}</div>
          )}
        </div>

        <div className="checkout__form">
          <div className="formGroup">
            <label>FULL NAME</label>
            <input value={form.full_name} onChange={onField("full_name")} type="text" />
          </div>

          <div className="formGroup">
            <label>STREET ADDRESS</label>
            <input value={form.address_line1} onChange={onField("address_line1")} type="text" />
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label>APT / UNIT</label>
              <input value={form.address_line2} onChange={onField("address_line2")} type="text" />
            </div>

            <div className="formGroup">
              <label>CITY</label>
              <input value={form.city} onChange={onField("city")} type="text" />
            </div>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label>STATE</label>
              <input value={form.state} onChange={onField("state")} type="text" />
            </div>

            <div className="formGroup">
              <label>ZIP CODE</label>
              <input value={form.postal_code} onChange={onField("postal_code")} type="text" />
            </div>
          </div>

          <div className="formGroup">
            <label>COUNTRY (2-letter)</label>
            <input value={form.country} onChange={onField("country")} type="text" />
          </div>

          <button
            className="checkout__button"
            onClick={createOrderAndIntent}
            disabled={loading || !canPay}
          >
            {loading ? "Preparing payment..." : "PAY WITH STRIPE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;