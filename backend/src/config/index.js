import "dotenv/config";

function required(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`[config] Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

export const config = Object.freeze({
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  logLevel: process.env.LOG_LEVEL ?? "info",

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY ?? "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? "7d",
  },

  gmail: {
    user: required("GMAIL_USER"),
    appPassword: required("GMAIL_APP_PASSWORD"),
  },

  backendUrl: process.env.BACKEND_URL ?? "http://localhost:3000",
  appName: process.env.APP_NAME ?? "Wrap Community",
});

if (
  config.env !== "production" &&
  (config.backendUrl.includes("localhost") || config.backendUrl.includes("127.0.0.1"))
) {
  console.warn(
    "[config] BACKEND_URL is localhost — email verify/reset links will not work on a phone. " +
      "Set BACKEND_URL=http://YOUR_LAN_IP:3000 in backend/.env (same IP as Expo, e.g. 192.168.0.106).",
  );
}
