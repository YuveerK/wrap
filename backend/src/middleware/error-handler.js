import { AppError } from "../libraries/errors.js";
import { logger } from "../libraries/logger.js";

export function errorHandler(err, req, res, next) {
  const isOperational = err instanceof AppError && err.isOperational;

  if (isOperational) {
    logger.warn({ err, requestId: req.id, path: req.path }, "operational error");
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  logger.error({ err, requestId: req.id, path: req.path }, "unexpected error");
  res.status(500).json({ error: { code: "INTERNAL", message: "Internal server error" } });
}
