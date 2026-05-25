import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

/**
 * @param {string | undefined} uri
 * @returns {string | null}
 */
function hostFromUri(uri) {
  if (!uri) return null;
  const host = String(uri).split(":")[0]?.replace(/^https?:\/\//, "");
  if (!host || host === "localhost" || host === "127.0.0.1") return null;
  return host;
}

/**
 * Machine running `expo start` — works for physical devices on the same Wi‑Fi.
 * @returns {string | null}
 */
function getExpoDevServerHost() {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.linkingUri,
  ];

  for (const uri of candidates) {
    const host = hostFromUri(uri);
    if (host) return host;
  }
  return null;
}

/**
 * Optional override: EXPO_PUBLIC_DEV_HOST=192.168.0.106 (IP only, no scheme).
 * @returns {string | null}
 */
function getDevHostOverride() {
  const raw = process.env.EXPO_PUBLIC_DEV_HOST?.trim();
  if (!raw) return null;
  return raw.replace(/^https?:\/\//, "").split(":")[0] || null;
}

/**
 * @param {string | undefined} envUrl
 * @returns {string}
 */
function resolveApiUrl(envUrl) {
  const explicit = envUrl?.trim();
  if (
    explicit &&
    !explicit.includes("localhost") &&
    !explicit.includes("127.0.0.1")
  ) {
    return explicit;
  }

  if (__DEV__) {
    if (Platform.OS === "android" && !Device.isDevice) {
      return "http://10.0.2.2:3000/api";
    }

    const host = getDevHostOverride() ?? getExpoDevServerHost();
    if (host) {
      return `http://${host}:3000/api`;
    }

    if (Platform.OS === "android") {
      return "http://10.0.2.2:3000/api";
    }
  }

  return explicit ?? "http://localhost:3000/api";
}

const resolvedApiUrl = resolveApiUrl(process.env.EXPO_PUBLIC_API_URL);

if (__DEV__) {
  const host = getDevHostOverride() ?? getExpoDevServerHost();
  console.log(
    "[config] API URL:",
    resolvedApiUrl,
    Device.isDevice ? "(physical device)" : "(simulator/emulator)",
    host ? `host=${host}` : "host=unknown — set EXPO_PUBLIC_DEV_HOST in mobile/.env",
  );
  if (
    Device.isDevice &&
    (resolvedApiUrl.includes("localhost") || resolvedApiUrl.includes("127.0.0.1"))
  ) {
    console.warn(
      "[config] Physical device cannot use localhost. Set EXPO_PUBLIC_DEV_HOST=YOUR_LAN_IP " +
        "(e.g. 192.168.0.106) in mobile/.env and restart Expo.",
    );
  }
}

const mediaBaseUrl =
  process.env.EXPO_PUBLIC_MEDIA_URL?.trim()?.replace(/\/$/, "") ||
  resolvedApiUrl.replace(/\/api\/?$/, "");

export const config = {
  apiUrl: resolvedApiUrl,
  mediaBaseUrl,
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  isDev: __DEV__,
};
