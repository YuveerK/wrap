import { StyleSheet } from "react-native";
import { spacing } from "@/theme/spacing";

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
});
