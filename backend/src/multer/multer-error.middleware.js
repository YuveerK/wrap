import multer from "multer";

const MULTER_CODES = {
  LIMIT_FILE_SIZE: {
    status: 400,
    code: "UPLOAD_FILE_TOO_LARGE",
    message: "Uploaded file is too large",
  },
  LIMIT_FILE_COUNT: {
    status: 400,
    code: "UPLOAD_TOO_MANY_FILES",
    message: "Too many files uploaded",
  },
  LIMIT_FIELD_COUNT: {
    status: 400,
    code: "UPLOAD_TOO_MANY_FIELDS",
    message: "Too many form fields submitted",
  },
  LIMIT_FIELD_VALUE: {
    status: 400,
    code: "UPLOAD_FIELD_TOO_LARGE",
    message: "One of the form fields is too large",
  },
  LIMIT_UNEXPECTED_FILE: {
    status: 400,
    code: "UPLOAD_UNEXPECTED_FIELD",
    message: "Unexpected file field",
  },
};

export function multerErrorMiddleware(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const mapped = MULTER_CODES[err.code];
    if (mapped) {
      return res.status(mapped.status).json({
        error: { code: mapped.code, message: mapped.message },
      });
    }
    return res.status(400).json({
      error: { code: "UPLOAD_ERROR", message: err.message },
    });
  }

  if (err?.message === "Unsupported file type") {
    return res.status(400).json({
      error: { code: "UPLOAD_UNSUPPORTED_TYPE", message: "Unsupported file type" },
    });
  }

  next(err);
}
