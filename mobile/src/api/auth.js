import { apiClient } from "./client";

/**
 * @param {import('@/lib/validation/authSchemas').registerSchema['_output']} data
 */
export async function register(data) {
  return apiClient.post("/auth/register", data);
}

/**
 * @param {{ email: string, password: string }} data
 */
export async function login(data) {
  return apiClient.post("/auth/login", data);
}

export async function fetchMe() {
  const res = await apiClient.get("/auth/me");
  return res.user;
}

/**
 * @param {string} refreshToken
 */
export async function refresh(refreshToken) {
  return apiClient.post("/auth/refresh", { refreshToken });
}

/**
 * @param {string | null | undefined} refreshToken
 */
export async function logout(refreshToken) {
  return apiClient.post("/auth/logout", { refreshToken: refreshToken ?? undefined });
}

/**
 * @param {string} email
 */
export async function forgotPassword(email) {
  return apiClient.post("/auth/forgot-password", { email });
}

/**
 * @param {string} token
 * @param {string} password
 */
export async function resetPassword(token, password) {
  return apiClient.post(`/auth/reset-password/${token}`, { password });
}
