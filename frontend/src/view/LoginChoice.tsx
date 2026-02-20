// src/view/LoginChoice.tsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/LoginChoice.css";

function isSafePath(p: string | null): p is string {
  return !!p && p.startsWith("/") && !p.startsWith("//");
}

const LoginChoice: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const rawNext = params.get("next");
  const safeNext = isSafePath(rawNext) ? rawNext : null;
  const nextParam = safeNext ? `?next=${encodeURIComponent(safeNext)}` : "";

  return (
    <div className="loginChoice">

      <div className="loginChoice__container">

        <h1 className="loginChoice__title">
          WELCOME
        </h1>

        <p className="loginChoice__subtitle">
          Log in or create an account to manage your orders and checkout faster.
        </p>

        <div className="loginChoice__buttons">

          <Link
            to={`/login${nextParam}`}
            className="loginChoice__btn loginChoice__btn--primary"
          >
            LOG IN
          </Link>

          <Link
            to={`/register${nextParam}`}
            className="loginChoice__btn loginChoice__btn--secondary"
          >
            REGISTER
          </Link>

        </div>

      </div>

    </div>
  );
};

export default LoginChoice;