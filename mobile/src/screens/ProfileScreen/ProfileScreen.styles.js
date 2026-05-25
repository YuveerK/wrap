import { StyleSheet } from "react-native";
import { spacing } from "@/theme/spacing";

export const styles = StyleSheet.create({
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  card: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  meta: {
    fontSize: 15,
    lineHeight: 22,
  },
  role: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  section: {
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionHint: {
    fontSize: 14,
    lineHeight: 20,
  },
});
