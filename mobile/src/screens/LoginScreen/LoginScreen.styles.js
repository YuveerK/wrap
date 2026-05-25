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
    marginBottom: spacing.md,
  },
  formError: {
    fontSize: 14,
    textAlign: "center",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  link: {
    fontSize: 15,
    fontWeight: "600",
  },
});
