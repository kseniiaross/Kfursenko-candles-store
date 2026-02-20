import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/authSlice";
import { register as registerApi } from "../services/auth";
import "../styles/Register.css";

type RegisterFormState = {
  first_name: string;
  last_name: string;
  phone_number: string;
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

type RegisterApiPayload = {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password: string;
};

function isSafePath(p: string | null): p is string {
  return !!p && p.startsWith("/") && !p.startsWith("//");
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function toNonEmptyStringOrUndefined(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function toUserOrUndefined(v: unknown): AuthUser | undefined {
  if (!isRecord(v)) return undefined;

  const id = v.id;
  const email = v.email;

  if (typeof id !== "number" || !Number.isFinite(id) || id <= 0) return undefined;
  if (typeof email !== "string" || !email.includes("@")) return undefined;

  const first_name = typeof v.first_name === "string" ? v.first_name : undefined;
  const last_name = typeof v.last_name === "string" ? v.last_name : undefined;

  return {
    id,
    email: email.trim().toLowerCase(),
    first_name,
    last_name,
  };
}

function toTokenResponseOrNull(v: unknown): TokenResponse | null {
  if (!isRecord(v)) return null;

  const access = toNonEmptyStringOrUndefined(v.access);
  if (!access) return null;

  const refresh = toNonEmptyStringOrUndefined(v.refresh);
  const user = toUserOrUndefined(v.user);

  return { access, refresh, user };
}

function getRegisterErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return "Network error. Please try again.";

  const status = error.response?.status;
  const data = error.response?.data;

  if (isRecord(data)) {
    const detail = data.detail;
    if (typeof detail === "string" && detail.trim()) return detail.trim();

    const keys = ["email", "password", "phone_number", "first_name", "last_name", "non_field_errors"];
    for (const k of keys) {
      const v = data[k];
      if (Array.isArray(v) && v.length && typeof v[0] === "string") return v[0];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }

  if (status === 400) return "Please check the form fields and try again.";
  return "Registration failed. Please try again.";
}

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<RegisterFormState>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    password: "",
  });

  const [fieldError, setFieldError] = useState<Partial<Record<keyof RegisterFormState, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const rawNext = params.get("next");
    return isSafePath(rawNext) ? rawNext : null;
  }, [location.search]);

  const safeNextQuery = nextParam ? `?next=${encodeURIComponent(nextParam)}` : "";

  const validate = (): boolean => {
    const e: Partial<Record<keyof RegisterFormState, string>> = {};

    if (!form.first_name.trim()) e.first_name = "First name is required.";
    if (!form.last_name.trim()) e.last_name = "Last name is required.";

    const phone = form.phone_number.trim();
    if (!phone) e.phone_number = "Phone number is required.";
    else if (!/^\+?[0-9\s().-]{7,20}$/.test(phone)) e.phone_number = "Enter a valid phone number.";

    const email = form.email.trim();
    if (!email) e.email = "Email is required.";
    else if (!email.includes("@")) e.email = "Enter a valid email.";

    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters.";

    setFieldError(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: RegisterApiPayload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone_number: form.phone_number.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const apiResult = await registerApi(payload);
      const token = toTokenResponseOrNull(apiResult);

      if (!token?.access) {
        setServerError("Registration failed. Please try again.");
        return;
      }

      // IMPORTANT: refresh must be undefined (not null), user must be undefined if absent
      dispatch(
        setCredentials({
          access: token.access,
          refresh: token.refresh ?? undefined,
          user: token.user ?? undefined,
        })
      );

      navigate(nextParam ?? "/", { replace: true });
    } catch (error: unknown) {
      setServerError(getRegisterErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="register" aria-label="Register">
      <div className="register__layout">
        <div className="register__left">
          <div className="register__content">
            <h2 className="register__title">CREATE ACCOUNT</h2>

            <p className="register__subtitle">
              Create an account to manage orders and checkout faster.
            </p>

            <form className="register__form" onSubmit={onSubmit} noValidate>
              <div className="register__field">
                <label className="register__label" htmlFor="reg_first_name">
                  First name
                </label>
                <input
                  id="reg_first_name"
                  className="register__input"
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))}
                  disabled={submitting}
                />
                {fieldError.first_name ? (
                  <div className="register__message register__message--error" role="alert">
                    {fieldError.first_name}
                  </div>
                ) : null}
              </div>

              <div className="register__field">
                <label className="register__label" htmlFor="reg_last_name">
                  Last name
                </label>
                <input
                  id="reg_last_name"
                  className="register__input"
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))}
                  disabled={submitting}
                />
                {fieldError.last_name ? (
                  <div className="register__message register__message--error" role="alert">
                    {fieldError.last_name}
                  </div>
                ) : null}
              </div>

              <div className="register__field">
                <label className="register__label" htmlFor="reg_phone">
                  Phone number
                </label>
                <input
                  id="reg_phone"
                  className="register__input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone_number}
                  onChange={(e) => setForm((s) => ({ ...s, phone_number: e.target.value }))}
                  disabled={submitting}
                />
                {fieldError.phone_number ? (
                  <div className="register__message register__message--error" role="alert">
                    {fieldError.phone_number}
                  </div>
                ) : null}
              </div>

              <div className="register__field">
                <label className="register__label" htmlFor="reg_email">
                  Email
                </label>
                <input
                  id="reg_email"
                  className="register__input"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  disabled={submitting}
                />
                {fieldError.email ? (
                  <div className="register__message register__message--error" role="alert">
                    {fieldError.email}
                  </div>
                ) : null}
              </div>

              <div className="register__field">
                <label className="register__label" htmlFor="reg_password">
                  Password
                </label>
                <input
                  id="reg_password"
                  className="register__input"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  disabled={submitting}
                />
                {fieldError.password ? (
                  <div className="register__message register__message--error" role="alert">
                    {fieldError.password}
                  </div>
                ) : null}
              </div>

              <div className="register__actions">
                <button
                  type="submit"
                  className="register__cta register__cta--primary"
                  disabled={submitting}
                >
                  {submitting ? "CREATING..." : "REGISTER"}
                </button>

                <Link to={`/login${safeNextQuery}`} className="register__cta register__cta--secondary">
                  LOG IN
                </Link>
              </div>

              {serverError ? (
                <div className="register__message register__message--server" role="alert" aria-live="polite">
                  {serverError}
                </div>
              ) : null}
            </form>
          </div>
        </div>

        <div className="register__right" aria-hidden="true">
          <div className="register__media">
            <div className="register__image" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;