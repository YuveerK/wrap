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
