import pino from "pino";
import { config } from "../config/index.js";

export const logger = pino({
  level: config.logLevel,
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "password",
    "*.password",
  ],
  ...(config.env === "development" && {
    transport: { target: "pino-pretty", options: { colorize: true } },
  }),
});
