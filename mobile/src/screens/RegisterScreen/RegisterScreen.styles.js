import { StyleSheet } from "react-native";
import { spacing } from "@/theme/spacing";

export const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  formError: {
    fontSize: 14,
    textAlign: "center",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  link: {
    fontSize: 15,
    fontWeight: "600",
  },
  devRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  devLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    marginRight: spacing.sm,
  },
});
