// src/view/Cart.tsx

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  updateQty,
  removeFromCart,
} from "../store/cartSlice";
import "../styles/Cart.css";

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const items = useAppSelector((s) => s.cart.items);

  const totalAmount = useMemo(
    () =>
      items.reduce((sum, item) => sum + 34 * item.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const handlePay = () => {
    if (items.length === 0) return;
    navigate("/checkout");
  };

  return (
    <div className="cart">
      <h1 className="cart__title">SHOPPING CART</h1>

      {items.length === 0 ? (
        <p className="cart__state">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart__list">
            {items.map((item) => (
              <div key={item.candle_id} className="cartItem">

                <div className="cartItem__image">
                  <img
                    src={`/images/test/mango_island1_main.jpg`}
                    alt="Candle"
                  />
                </div>

                <div className="cartItem__info">
                  <div className="cartItem__topRow">
                    <div className="cartItem__name">
                      Candle #{item.candle_id}
                    </div>

                    <button
                      className="cartItem__remove"
                      onClick={() =>
                        dispatch(removeFromCart(item.candle_id))
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="cartItem__bottomRow">
                    <div className="cartItem__price">
                      {money(34)}
                    </div>

                    <div className="cartItem__qty">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQty({
                              candle_id: item.candle_id,
                              quantity: item.quantity - 1,
                            })
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          dispatch(
                            updateQty({
                              candle_id: item.candle_id,
                              quantity: item.quantity + 1,
                            })
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="cart__footer">
            <div className="cart__summary">
              <div className="cart__count">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </div>
              <div className="cart__total">
                {money(totalAmount)}
              </div>
            </div>

            <button
              className="cart__pay"
              onClick={handlePay}
            >
              PAY
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;