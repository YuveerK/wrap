import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../../config/index.js";
import { ensureUploadDirectory } from "./ensure-upload-directory.js";

/**
 * @param {string} tempPath
 * @param {string} [subfolder="posts"]
 * @returns {Promise<string>} urlPath relative to public uploads root (e.g. posts/uuid.jpg)
 */
export async function moveToPublic(tempPath, subfolder = "posts") {
  const destDir = path.join(config.upload.publicDir, subfolder);
  ensureUploadDirectory(destDir);

  const fileName = path.basename(tempPath);
  const destPath = path.join(destDir, fileName);
  await fs.rename(tempPath, destPath);

  return path.posix.join(subfolder, fileName);
}
