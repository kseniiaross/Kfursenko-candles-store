import axios, { AxiosHeaders } from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from "../utils/token";

/* ================================
   Base URL
================================ */

const raw = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const normalized = raw.replace(/\/+$/, "");
const baseURL = normalized.endsWith("/api")
  ? normalized
  : `${normalized}/api`;

const api = axios.create({
  baseURL,
  withCredentials: false,
});

/* ================================
   Auth routes that don't need token
================================ */

const NO_AUTH_ROUTES = [
  "/accounts/token/",
  "/accounts/token/refresh/",
  "/accounts/register/",
];

function isNoAuthRequest(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? "";
  return NO_AUTH_ROUTES.some((route) => url.startsWith(route));
}

/* ================================
   Set Authorization header safely
================================ */

function setAuthHeader(
  config: InternalAxiosRequestConfig,
  token: string
) {
  config.headers = AxiosHeaders.from(config.headers);
  config.headers.set("Authorization", `Bearer ${token}`);
}

/* ================================
   Request interceptor
================================ */

api.interceptors.request.use((config) => {
  if (isNoAuthRequest(config)) return config;

  const token = getAccessToken();
  if (token) setAuthHeader(config, token);

  return config;
});

/* ================================
   Refresh logic
================================ */

type RefreshResponse = {
  access: string;
};

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const response = await axios.post<RefreshResponse>(
    `${baseURL}/accounts/token/refresh/`,
    { refresh }
  );

  const newAccess = response.data?.access;

  if (!newAccess) {
    throw new Error("Invalid refresh response");
  }

  setAccessToken(newAccess);
  return newAccess;
}

/* ================================
   Response interceptor
================================ */

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (status !== 401 || isNoAuthRequest(originalRequest)) {
      return Promise.reject(error);
    }

    const request = originalRequest as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (request._retry) {
      clearTokens();
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      if (isRefreshing) {
        return await new Promise((resolve, reject) => {
          queue.push((token) => {
            if (!token) {
              clearTokens();
              reject(error);
              return;
            }

            setAuthHeader(request, token);
            resolve(api(request));
          });
        });
      }

      isRefreshing = true;

      const newAccessToken = await refreshAccessToken();
      resolveQueue(newAccessToken);

      setAuthHeader(request, newAccessToken);
      return api(request);

    } catch (refreshError) {
      resolveQueue(null);
      clearTokens();
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default api;