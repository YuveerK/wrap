import fs from "node:fs";

export function ensureUploadDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}
