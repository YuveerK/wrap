import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export async function saveAuthTokens(accessToken, refreshToken) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

/** @deprecated Use saveAuthTokens */
export async function saveAuthToken(token) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getAuthToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearAuthTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

/** @deprecated Use clearAuthTokens */
export async function clearAuthToken() {
  await clearAuthTokens();
}
