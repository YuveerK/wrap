import path from "node:path";

export function getFileExtension(fileName) {
  return path.extname(fileName).toLowerCase();
}
