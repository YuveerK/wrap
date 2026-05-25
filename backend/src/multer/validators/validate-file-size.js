export function validateFileSize(file, maxSizeInBytes) {
  return file.size <= maxSizeInBytes;
}
