export class AppError extends Error {
  constructor(message, { status = 500, code = "INTERNAL", isOperational = true, cause } = {}) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, { status: 400, code: "VALIDATION_FAILED" });
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, { status: 404, code: "NOT_FOUND" });
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, { status: 409, code: "CONFLICT" });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, { status: 403, code: "FORBIDDEN" });
  }
}
