import { randomUUID } from "node:crypto";
import path from "node:path";

export function generateSafeFileName(originalName) {
  const extension = path.extname(originalName).toLowerCase();
  return `${randomUUID()}${extension}`;
}
