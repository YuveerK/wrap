/**
 * Documented semantic colour overrides (DESIGN_SYSTEM §2.2).
 * @param {"light" | "dark"} scheme
 */
export function getSemanticColors(scheme) {
  const isDark = scheme === "dark";

  return {
    feedListBackground: isDark ? "#111827" : "#F5F7FB",
    cardBackground: isDark ? "#1A2236" : "#FFFFFF",
    postBodyText: isDark ? "#B8C4D8" : "#374151",
    footerDivider: isDark ? "#2A3450" : "#F0F2F6",
    heroBackground: isDark ? "#1F2937" : "#FFF7ED",
    emptyStateRing: isDark ? "#1F2937" : "#FFF7ED",
  };
}
