import { ValidationError } from "../libraries/errors.js";

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ValidationError("Invalid request data", result.error.flatten()));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new ValidationError("Invalid query parameters", result.error.flatten()));
    }
    // Express 5 exposes req.query as read-only; store parsed values separately.
    req.validatedQuery = result.data;
    next();
  };
}
