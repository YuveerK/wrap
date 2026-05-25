import path from "node:path";

export function validateFileExtension(originalName, allowedExtensions) {
  const extension = path.extname(originalName).toLowerCase();
  return allowedExtensions.includes(extension);
}
