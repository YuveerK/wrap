import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const MIME_BY_EXT = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

const EXT_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
  "application/pdf": ".pdf",
};

/**
 * @param {string} name
 */
function guessMimeFromName(name) {
  const ext = name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  return ext ? MIME_BY_EXT[ext] : null;
}

/**
 * @param {string} name
 * @param {string} type
 */
function ensureExtension(name, type) {
  if (/\.[a-z0-9]+$/i.test(name)) return name;
  const ext = EXT_BY_MIME[type] ?? ".jpg";
  return `${name}${ext}`;
}

/**
 * Copies content:// (and other non-file) URIs to cache so fetch multipart works on Android.
 * @param {{ uri: string, name: string, type: string }} file
 */
export async function normalizeUploadFile(file) {
  let uri = file.uri;
  let name = ensureExtension(file.name, file.type);
  let type =
    file.type && file.type !== "application/octet-stream"
      ? file.type
      : guessMimeFromName(name) ?? "image/jpeg";

  const needsCopy =
    uri.startsWith("content://") ||
    uri.startsWith("ph://") ||
    (Platform.OS === "android" && !uri.startsWith("file://"));

  if (needsCopy) {
    const dest = `${FileSystem.cacheDirectory}${name}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    uri = dest.startsWith("file://") ? dest : `file://${dest}`;
  } else if (Platform.OS === "android" && !uri.startsWith("file://")) {
    uri = `file://${uri}`;
  }

  return { uri, name, type };
}

/**
 * @param {import("react-native").FormData} form
 * @param {string} field
 * @param {{ uri: string, name: string, type: string }} file
 */
export async function appendUploadFile(form, field, file) {
  const normalized = await normalizeUploadFile(file);
  form.append(field, {
    uri: normalized.uri,
    name: normalized.name,
    type: normalized.type,
  });
}
