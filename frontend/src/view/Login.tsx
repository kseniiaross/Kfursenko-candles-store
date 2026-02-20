// src/view/Login.tsx

import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/authSlice";
import { login } from "../services/auth";
import "../styles/Login.css";

type LoginFormState = {
  email: string;
  password: string;
};

type AuthUser = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
};

type TokenResponse = {
  access: string;
  refresh?: string;
  user?: AuthUser;
};

function isSafePath(p: string | null): p is string {
  return !!p && p.startsWith("/") && !p.startsWith("//");
}

function getLoginErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Network error. Please try again.";
  }

  const status = error.response?.status;

  if (status === 401 || status === 400) {
    return "Invalid email or password.";
  }

  const data = error.response?.data;
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail.trim();
    }
  }

  return "Something went wrong. Please try again.";
}

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });

  const [fieldError, setFieldError] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const rawNext = params.get("next");
    return isSafePath(rawNext) ? rawNext : null;
  }, [location.search]);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!form.email.includes("@")) {
      errors.email = "Enter a valid email.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    }

    setFieldError(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const result = (await login({
        email: form.email.trim(),
        password: form.password,
      })) as TokenResponse;

      if (!result.access) {
        setServerError("Login failed. Please try again.");
        return;
      }

      dispatch(
        setCredentials({
          access: result.access,
          refresh: result.refresh ?? undefined,
          user: result.user ?? undefined,
        })
      );

      navigate(nextParam ?? "/", { replace: true });

    } catch (error: unknown) {
      setServerError(getLoginErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const safeNextQuery = nextParam
    ? `?next=${encodeURIComponent(nextParam)}`
    : "";

  return (
    <section className="login" aria-label="Login">
      <div className="login__layout">
        <div className="login__left">
          <div className="login__content">
            <h2 className="login__title">LOG IN</h2>

            <p className="login__subtitle">
              Use your email and password to access your account.
            </p>

            <form className="login__form" onSubmit={onSubmit} noValidate>
              <div className="login__field">
                <label className="login__label" htmlFor="login_email">
                  Email
                </label>
                <input
                  id="login_email"
                  className="login__input"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }
                  disabled={submitting}
                />
                {fieldError.email && (
                  <div className="login__message login__message--error">
                    {fieldError.email}
                  </div>
                )}
              </div>

              <div className="login__field">
                <label className="login__label" htmlFor="login_password">
                  Password
                </label>
                <input
                  id="login_password"
                  className="login__input"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, password: e.target.value }))
                  }
                  disabled={submitting}
                />
                {fieldError.password && (
                  <div className="login__message login__message--error">
                    {fieldError.password}
                  </div>
                )}
              </div>

              <div className="login__actions">
                <button
                  type="submit"
                  className="login__cta login__cta--primary"
                  disabled={submitting}
                >
                  {submitting ? "LOGGING IN..." : "LOG IN"}
                </button>

                <Link
                  to={`/register${safeNextQuery}`}
                  className="login__cta login__cta--secondary"
                >
                  REGISTER
                </Link>
              </div>

              {serverError && (
                <div className="login__message login__message--server">
                  {serverError}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="login__right" aria-hidden="true">
          <div className="login__media">
            <div className="login__image" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;