import { AppError } from "../libraries/errors.js";

export function errorHandler(err, req, res, next) {
  const isOperational = err instanceof AppError && err.isOperational;

  if (isOperational) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Internal server error" } });
}
