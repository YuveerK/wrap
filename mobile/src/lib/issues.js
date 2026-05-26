export const ISSUE_CATEGORIES = [
  "POTHOLE",
  "ELECTRICITY",
  "WATER",
  "ROADS",
  "WASTE",
  "OTHER",
];

export const ISSUE_STATUSES = [
  "REPORTED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

/** @type {Record<string, string>} */
export const categoryLabels = {
  POTHOLE: "Roads",
  ELECTRICITY: "Electrical",
  WATER: "Water",
  ROADS: "Roads",
  WASTE: "Waste",
  OTHER: "Other",
};

/** @type {Record<string, string>} */
export const categoryIcons = {
  POTHOLE: "construct-outline",
  ELECTRICITY: "flash-outline",
  WATER: "water-outline",
  ROADS: "construct-outline",
  WASTE: "trash-outline",
  OTHER: "alert-circle-outline",
  // kind picker values
  Roads: "construct-outline",
  Water: "water-outline",
  Electrical: "flash-outline",
  Waste: "trash-outline",
  Safety: "shield-half-outline",
  Other: "alert-circle-outline",
};

/** @type {Record<string, string>} */
export const statusLabels = {
  REPORTED: "Reported",
  ACKNOWLEDGED: "Acknowledged",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

/**
 * Semantic fg + bg per status (§07 status colour map).
 * fg is a static hex; bg is computed as hexAlpha(fg, opacity) at usage site.
 * @type {Record<string, { fg: string, bgOpacity: number }>}
 */
export const statusMeta = {
  REPORTED:     { fg: "#6B7280", bgOpacity: 0.12 },
  ACKNOWLEDGED: { fg: "#0EA5E9", bgOpacity: 0.13 },
  IN_PROGRESS:  { fg: "#FF8A08", bgOpacity: 0.14 },
  RESOLVED:     { fg: "#16A34A", bgOpacity: 0.10 },
  CLOSED:       { fg: "#6B7280", bgOpacity: 0.12 },
};

/** Legacy solid colours kept for backward-compat. */
export const statusColors = {
  REPORTED: "#6B7280",
  ACKNOWLEDGED: "#0EA5E9",
  IN_PROGRESS: "#FF8A08",
  RESOLVED: "#16A34A",
  CLOSED: "#374151",
};

/**
 * Convert a hex colour + opacity fraction to rgba string.
 * @param {string} hex — 6-digit hex (e.g. "#FF8A08")
 * @param {number} alpha — 0–1
 */
export function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
