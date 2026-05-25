import { config } from "../config/index.js";

/** @param {string | null | undefined} urlPath */
export function buildPublicMediaUrl(urlPath) {
  if (!urlPath) return null;
  const base = config.backendUrl.replace(/\/$/, "");
  const prefix = config.upload.publicBaseUrl.startsWith("/")
    ? config.upload.publicBaseUrl
    : `/${config.upload.publicBaseUrl}`;
  const path = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
  return `${base}${prefix}${path}`;
}
