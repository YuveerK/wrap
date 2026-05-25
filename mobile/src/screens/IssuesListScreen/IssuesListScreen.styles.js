import { StyleSheet } from "react-native";
import { spacing } from "@/theme/spacing";

export const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sep: {
    height: spacing.sm,
  },
  empty: {
    textAlign: "center",
    padding: spacing.lg,
  },
  headerBtn: {
    marginRight: spacing.md,
  },
  headerBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
