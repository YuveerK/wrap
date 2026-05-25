import { config } from "@/constants/config";
import {
  clearAuthTokens,
  getAuthToken,
  getRefreshToken,
  saveAuthTokens,
} from "@/lib/auth";

export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {string} code
   * @param {string} message
   */
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const AUTH_SKIP_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/forgot-password",
];

function shouldSkipRefresh(path) {
  return AUTH_SKIP_REFRESH_PATHS.some((p) => path.startsWith(p) || path.includes(p));
}

async function tryRefreshTokens() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${config.apiUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearAuthTokens();
    return false;
  }

  const body = await res.json();
  await saveAuthTokens(body.accessToken, body.refreshToken);
  return true;
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 * @param {boolean} [retried]
 */
async function request(path, init = {}, retried = false) {
  const token = await getAuthToken();
  const res = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init.headers,
    },
  });

  if (res.status === 401 && !retried && !shouldSkipRefresh(path)) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) return request(path, init, true);
    await clearAuthTokens();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error?.code ?? "UNKNOWN",
      body.error?.message ?? res.statusText,
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

/**
 * @param {string} path
 * @param {FormData} formData
 * @param {boolean} [retried]
 */
async function postMultipart(path, formData, retried = false) {
  const token = await getAuthToken();
  const res = await fetch(`${config.apiUrl}${path}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (res.status === 401 && !retried && !shouldSkipRefresh(path)) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) return postMultipart(path, formData, true);
    await clearAuthTokens();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error?.code ?? "UNKNOWN",
      body.error?.message ?? res.statusText,
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  postMultipart,
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
