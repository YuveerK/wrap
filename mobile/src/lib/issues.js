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
  POTHOLE: "Pothole",
  ELECTRICITY: "Electricity",
  WATER: "Water / leak",
  ROADS: "Roads",
  WASTE: "Waste",
  OTHER: "Other",
};

/** @type {Record<string, string>} */
export const statusLabels = {
  REPORTED: "Reported",
  ACKNOWLEDGED: "Acknowledged",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

/** @type {Record<string, string>} */
export const statusColors = {
  REPORTED: "#6B7280",
  ACKNOWLEDGED: "#2563EB",
  IN_PROGRESS: "#D97706",
  RESOLVED: "#16A34A",
  CLOSED: "#374151",
};
