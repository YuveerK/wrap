import path from "node:path";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".pdf",
]);

function hasAllowedExtension(fileName) {
  const ext = path.extname(fileName ?? "").toLowerCase();
  return allowedExtensions.has(ext);
}

export function fileFilter(_req, file, cb) {
  if (allowedMimeTypes.has(file.mimetype)) {
    return cb(null, true);
  }

  // React Native often sends application/octet-stream; trust filename extension.
  if (
    file.mimetype === "application/octet-stream" &&
    hasAllowedExtension(file.originalname)
  ) {
    return cb(null, true);
  }

  cb(new Error("Unsupported file type"), false);
}
