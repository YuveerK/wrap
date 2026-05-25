import fs from "node:fs/promises";

export async function cleanupTempFile(filePath) {
  if (!filePath) return;
  await fs.unlink(filePath).catch(() => null);
}

export async function cleanupTempFiles(files) {
  if (!files?.length) return;
  await Promise.all(files.map((f) => cleanupTempFile(f.path)));
}
