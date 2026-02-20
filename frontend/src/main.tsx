import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import App from "./App";
import { store } from "./store"; // проверь путь если у тебя ./store/index

// Безопасная загрузка Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <App />
          </Elements>
        ) : (
          <App />
        )}
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);