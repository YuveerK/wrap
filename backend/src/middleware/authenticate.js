import { AppError } from "../libraries/errors.js";
import { verifyAccessToken } from "../libraries/jwt.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid authorization header", { status: 401, code: "UNAUTHORIZED" }));
  }

  const token = authHeader.slice(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError("Invalid or expired access token", { status: 401, code: "UNAUTHORIZED" }));
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError("You do not have permission to perform this action", { status: 403, code: "FORBIDDEN" }));
    }
    next();
  };
}
