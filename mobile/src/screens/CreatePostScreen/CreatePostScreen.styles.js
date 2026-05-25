import { StyleSheet } from "react-native";
import { spacing } from "@/theme/spacing";

export const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  bannerPicker: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: spacing.lg,
    minHeight: 160,
  },
  bannerPreview: {
    width: "100%",
    height: 180,
  },
  removeBanner: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: 14,
  },
  bannerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  placeholderText: {
    fontSize: 14,
  },
  attachHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  attachRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  attachThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  attachName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  error: {
    fontSize: 14,
  },
});
