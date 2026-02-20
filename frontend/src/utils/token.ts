const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";
const USER_KEY = "user";

const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

function safeGet(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch {
  }
}

function safeRemove(key: string): void {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch {
  }
}

export function getAccessToken(): string | null {
  return safeGet(ACCESS_KEY);
}

export function setAccessToken(token: string): void {
  const t = String(token || "").trim();
  if (!t) return;
  safeSet(ACCESS_KEY, t);
}

export function removeAccessToken(): void {
  safeRemove(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return safeGet(REFRESH_KEY);
}

export function setRefreshToken(token: string): void {
  const t = String(token || "").trim();
  if (!t) return;
  safeSet(REFRESH_KEY, t);
}

export function removeRefreshToken(): void {
  safeRemove(REFRESH_KEY);
}

export function clearTokens(): void {
  safeRemove(ACCESS_KEY);
  safeRemove(REFRESH_KEY);
  safeRemove("token");
  safeRemove("access_token");
}

export function clearAuthStorage(): void {
  clearTokens();
  safeRemove(USER_KEY);
}

export const AUTH_STORAGE_KEYS = {
  ACCESS_KEY,
  REFRESH_KEY,
  USER_KEY,
} as const;